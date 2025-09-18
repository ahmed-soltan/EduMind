import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/conn";
import {
  plans,
  subscriptions,
  tenantMembers,
  tenantRoles,
  tenants,
  users,
} from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { Plans, User } from "@/db/types";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

const PAYMOB_SECRET_KEY =
  process.env.PAYMOB_SECRET_KEY ||
  "egy_sk_test_26aa83eb99befcd8eb4de3c32c97878d0bcc852eec54573efe23ebee46ed8dbf";
const PAYMOB_PUBLIC_KEY =
  process.env.PAYMOB_PUBLIC_KEY ||
  "egy_pk_test_03f6611IZkMXFAIj1wuIyzZ2pzhxdUg6";
const SUBSCRIPTION_PLAN_IDS = {
  PRO_PLAN_MONTHLY: "4317",
  PRO_PLAN_ANNUAL: "4318",
  TEAMS_PLAN_ANNUAL: "4331",
  TEAMS_PLAN_MONTHLY: "4332",
};

async function createPaymentIntention(
  plan: Plans,
  tenantId: string,
  planId: string,
  user: User,
  billingCycle: "monthly" | "annual",
  localSubscriptionId: string // NEW: pass our local id so we can include it in extras
) {
  // Replace all whitespace with underscores
  const planSegment = plan.name.toUpperCase().replace(/\s+/g, "_");
  const cycleSegment = billingCycle.toUpperCase();
  const subscriptionPlanKey =
    `${planSegment}_PLAN_${cycleSegment}` as keyof typeof SUBSCRIPTION_PLAN_IDS;

  const subscriptionPlanId = SUBSCRIPTION_PLAN_IDS[subscriptionPlanKey];
  if (!subscriptionPlanId) throw new Error("Invalid subscription plan ID");

  const headers = new Headers();
  headers.append("Authorization", `Token ${PAYMOB_SECRET_KEY}`);
  headers.append("Content-Type", "application/json");

  // start date = tomorrow (as you had)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const subscriptionStartDate = tomorrow.toISOString().split("T")[0];

  // include our localSubscriptionId in extras so Paymob echoes it back in webhooks
  const intentionData = {
    amount: plan.cents,
    currency: "EGP",
    payment_methods: [5267275],
    subscription_plan_id: parseInt(subscriptionPlanId, 10),
    subscription_start_date: subscriptionStartDate,
    items: [
      {
        name: `Subscription ${planId}`,
        amount: plan.cents,
        description: `Subscription for ${planId}`,
        quantity: 1,
      },
    ],
    billing_data: {
      first_name: user.firstName || "User",
      last_name: user.lastName || "Name",
      email: user.email || "user@example.com",
      phone_number: "N/A",
      extras: { tenantId, localSubscriptionId },
    },
    customer: {
      first_name: user.firstName || "User",
      last_name: user.lastName || "Name",
      email: user.email || "user@example.com",
      extras: {
        tenantId,
        localSubscriptionId,
        hasOnboarded: user.hasOnboarded,
      },
    },
    extras: { tenantId, localSubscriptionId },
  };

  const response = await fetch("https://accept.paymob.com/v1/intention", {
    method: "POST",
    headers,
    body: JSON.stringify(intentionData),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to create payment intention");
  return data;
}

export const POST = async (req: NextRequest) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { planId, billingCycle } = body;

  // validate billingCycle
  const allowedCycles = ["monthly", "annual"];
  if (!allowedCycles.includes(billingCycle)) {
    return NextResponse.json(
      { message: "Invalid billing cycle" },
      { status: 400 }
    );
  }

  const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
  if (!plan) {
    return NextResponse.json({ message: "Invalid plan" }, { status: 400 });
  }

  let tenantId = body.tenantId;

  if (!tenantId) {
    const [tenant] = await db
      .insert(tenants)
      .values({
        id: crypto.randomUUID(),
        ownerId: session.user.id,
      })
      .onConflictDoNothing()
      .returning({
        id: tenants.id,
      });

    if (!tenant) {
      console.error("Failed to create tenant");
      return NextResponse.json(
        { message: "Failed to create tenant" },
        { status: 500 }
      );
    }

    tenantId = tenant.id;

    const [role] = await db
      .select({
        id: tenantRoles.id,
      })
      .from(tenantRoles)
      .where(eq(tenantRoles.roleName, "owner"));

    await db
      .insert(tenantMembers)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        tenantId: tenant.id,
        roleId: role.id,
      })
      .onConflictDoNothing();
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  // Free plan: create subscription immediately (unchanged)
  if (plan.cents === 0) {
    const [sub] = await db
      .insert(subscriptions)
      .values({
        id: crypto.randomUUID(),
        tenantId,
        planId: plan.id,
        startDate: new Date(),
        status: "active",
      })
      .returning();
    return NextResponse.json(sub);
  }

  // Create a local pending subscription first (so we have a localSubscriptionId to include in Paymob extras)
  const localSubscriptionId = crypto.randomUUID();
  const now = new Date();
  const renewalDate =
    billingCycle === "annual"
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Insert a placeholder pending subscription (on conflict do nothing if already exists)
  await db
    .insert(subscriptions)
    .values({
      id: localSubscriptionId,
      tenantId,
      planId: plan.id,
      startDate: now,
      renewalDate,
      price_cents: plan.cents,
      billingCycle,
      currency: "egp",
    })
    .onConflictDoNothing();

  try {
    const intention = await createPaymentIntention(
      plan,
      tenantId,
      planId,
      user,
      billingCycle,
      localSubscriptionId
    );

    // IMPORTANT: Save the payment intention id (providerPendingId) into local subscription so webhook can match it.
    await db
      .update(subscriptions)
      .set({
        providerPendingId: intention.id,
        // optionally store client_secret for debug (not required)
        // providerClientSecret: intention.client_secret,
      })
      .where(eq(subscriptions.id, localSubscriptionId));

    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${intention.client_secret}`;

    // Return checkout url AND our local subscription id (so frontend can show pending state)
    return NextResponse.json({
      checkoutUrl,
      intentionId: intention.id, // payment intention
      localSubscriptionId, // YOUR internal id that will be updated later by webhook
    });
  } catch (error) {
    console.error("Paymob subscription error:", error);
    // mark local subscription as failed
    await db
      .update(subscriptions)
      .set({ status: "failed" })
      .where(eq(subscriptions.id, localSubscriptionId));

    return NextResponse.json(
      { message: "Failed to initiate subscription" },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const subdomain = extractSubdomain(req);

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 400 });
  }

  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return NextResponse.json({ message: "No tenant found" }, { status: 404 });
  }

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .leftJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.tenantId, tenant.id),
        eq(subscriptions.status, "active")
      )
    )
    .orderBy(subscriptions.startDate)
    .limit(1);

  return NextResponse.json(subscription);
};
