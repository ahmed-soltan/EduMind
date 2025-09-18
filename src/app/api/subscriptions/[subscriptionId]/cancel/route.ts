import { getUserSession } from "@/utils/get-user-session";
import { NextRequest, NextResponse } from "next/server";
import { db, redis } from "@/db/conn";
import { subscriptions, plans, invoices, tenantMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY!; // from your Paymob dashboard
const PAYMOB_AUTH_URL = "https://accept.paymob.com/api/auth/tokens";
const PAYMOB_CANCEL_URL =
  "https://accept.paymob.com/api/acceptance/subscriptions";
const PAYMOB_TRANSACTION_URL =
  "https://accept.paymob.com/api/acceptance/subscriptions";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) => {
  try {
    const session = await getUserSession();

    if (!session.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { subscriptionId } = await params;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // 1) Get Paymob Auth Token
    const authRes = await fetch(PAYMOB_AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    });

    if (!authRes.ok) {
      throw new Error("Failed to authenticate with Paymob");
    }

    const { token } = await authRes.json();

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId));

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    const transactionRes = await fetch(
      `${PAYMOB_TRANSACTION_URL}?transaction=${subscription.providerTransactionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!transactionRes.ok) {
      throw new Error("Failed to fetch subscription details from Paymob");
    }

    const transactionDetails = await transactionRes.json();

    const transactionSubscriptionId = transactionDetails?.results?.[0]?.id;
    if (!transactionSubscriptionId) {
      throw new Error("Could not find Paymob subscription id in response");
    }

    // 2) Cancel the subscription on Paymob
    const cancelRes = await fetch(
      `${PAYMOB_CANCEL_URL}/${transactionSubscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const cancelData = await cancelRes.json();

    if (!cancelRes.ok) {
      console.error("Paymob cancel failed:", cancelData);
      return NextResponse.json(
        { error: "Failed to cancel subscription", details: cancelData },
        { status: 400 }
      );
    }

    // --- Additional steps: remove invited members if user was on a team plan ---

    // Fetch the current plan row (the plan the subscription was using)
    const [currentPlan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, subscription.planId));

    const isTeamPlan =
      !!currentPlan &&
      (currentPlan.name === "Teams" ||
        (currentPlan.name && currentPlan.name.toLowerCase().includes("teams")));

    const removedInvited: string[] = [];
    const failedToRemove: { id: string; reason: string }[] = [];

    if (isTeamPlan) {
      // find members that this user invited in this tenant
      const invitedMembers = await db
        .select()
        .from(tenantMembers)
        .where(
          and(
            eq(tenantMembers.tenantId, subscription.tenantId),
            eq(tenantMembers.invitedBy, session.user.id)
          )
        );

      for (const m of invitedMembers) {
        // Never remove the tenant owner by mistake
        // (an invited user shouldn't be owner, but this is an extra guard)
        if (m.userId === session.user.id) {
          failedToRemove.push({
            id: m.id,
            reason: "Refused to remove owner or self",
          });
          continue;
        }

        try {
          // Try hard delete first
          await db.delete(tenantMembers).where(eq(tenantMembers.id, m.id));
          await redis.del(`ctx:tenantMember:${m.userId}:${m.tenantId}`); // clear cached ctx if any
          removedInvited.push(m.id);
        } catch (err: any) {
          // If FK constraint or other DB error prevents deletion, try soft-delete fallbacks
          console.warn(`Hard delete failed for member ${m.id}:`, err?.message);

          // Try setting isActive = false
          try {
            await db
              .update(tenantMembers)
              .set({ isActive: false })
              .where(eq(tenantMembers.id, m.id));
            removedInvited.push(m.id);
            continue;
          } catch (err3: any) {
            console.warn(
              `Setting isActive failed for ${m.id} (maybe no column):`,
              err3?.message
            );
          }

          // If none of the fallbacks worked, record failure
          failedToRemove.push({
            id: m.id,
            reason:
              err?.message ||
              "Unable to delete or soft-delete member. Check foreign keys.",
          });
        }
      }
    }

    // --- Update subscription records in DB ---
    const [freePlan] = await db.select().from(plans).where(eq(plans.cents, 0)); // assuming free plan = 0 EGP

    if (!freePlan) {
      throw new Error("Free plan not found in DB");
    }

    // Update the existing subscription to canceled, and insert a new free subscription
    await Promise.all([
      db
        .update(subscriptions)
        .set({
          status: "canceled",
          renewalDate: null,
        })
        // update by internal id (not provider id)
        .where(eq(subscriptions.id, subscription.id)),
      db.insert(subscriptions).values({
        id: crypto.randomUUID(),
        tenantId: subscription.tenantId,
        planId: freePlan.id,
        price_cents: freePlan.cents,
        currency: freePlan.currency,
        status: "active",
        startDate: new Date(),
      }),
    ]);

    return NextResponse.json({
      message: "Subscription canceled successfully",
      paymobResponse: cancelData,
      teamCleanup: {
        isTeamPlan,
        removedInvitedCount: removedInvited.length,
        removedInvited,
        failedToRemove,
      },
    });
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Cancel subscription failed", details: error.message },
      { status: 500 }
    );
  }
};
