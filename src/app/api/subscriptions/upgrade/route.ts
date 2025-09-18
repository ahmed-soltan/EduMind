// /api/subscription/upgrade-downgrade/route.ts

import { getUserSession } from "@/utils/get-user-session";
import { db } from "@/db/conn";
import { plans, subscriptions, tenantMembers, tenants } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getUserSession();
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, billingCycle } = await req.json();

    const subdomain = extractSubdomain(req);

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain not found" },
        { status: 400 }
      );
    }

    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
      return NextResponse.json({ message: "No tenant found" }, { status: 404 });
    }

    const [currentSub] = await db
      .select({
        subscription: subscriptions,
        plan: plans,
      })
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

    // If no subscription exists, we'll let the /api/subscription endpoint handle creating the first one
    // If subscription exists and is not free (price_cents > 0), cancel it first
    if (
      currentSub &&
      currentSub.subscription.price_cents &&
      currentSub.subscription.price_cents > 0
    ) {
      if (currentSub.subscription) {
        const cancelRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${currentSub.subscription.id}/cancel`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: req.headers.get("cookie") || "", // forward cookies for session auth
            },
          }
        );

        if (!cancelRes.ok) {
          return NextResponse.json(
            { error: "Failed to cancel existing subscription" },
            { status: cancelRes.status }
          );
        }
      }
    }

    await db
      .update(subscriptions)
      .set({ status: "canceled" })
      .where(eq(subscriptions.id, currentSub.subscription.id));

    // 3. Forward request to /api/subscription to create a new one
    const createRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") || "", // forward cookies for session auth
        },
        body: JSON.stringify({ planId, billingCycle, tenantId: tenant.id }),
      }
    );

    const data = await createRes.json();

    if (!createRes.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create new subscription" },
        { status: createRes.status }
      );
    }

    return NextResponse.json({
      message: "Subscription upgraded/downgraded successfully",
      newSubscription: data,
    });
  } catch (err: any) {
    console.error("Upgrade/Downgrade error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
