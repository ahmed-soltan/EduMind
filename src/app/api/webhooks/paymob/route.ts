// app/api/paymob/webhook/route.ts
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import { Invoice } from "@/db/types";
import { invoices, plans, subscriptions } from "@/db/schema";

/**
 * Paymob webhook handler (update-only)
 *
 * Behavior:
 * - Extract mapping ids (localSubscriptionId, providerPendingId, providerSubscriptionId, providerId)
 * - Find existing subscription row using localSubscriptionId > providerPendingId > providerId
 * - If found: update the row (status -> active, attach provider ids, set dates/prices)
 * - If not found: log and return 200 (no insert)
 *
 * Note: keep logging enabled in staging. Add signature verification in production.
 */

export const POST = async (req: NextRequest) => {
  try {
    // Read body and log raw payload for debugging
    const body = await req.json();

    // Normalize shape
    const type = body.type;
    const obj = body.obj;

    // Extract common places where Paymob puts extras / payment_key_claims
    const pkExtra = obj?.payment_key_claims?.extra;

    // localSubscriptionId (we included it in extras when creating intention)
    const localSubscriptionId = pkExtra?.localSubscriptionId;

    // provider pending (payment intention) id
    const providerPendingId = obj?.data?.id;

    // provider subscription id (the final subscription id from Paymob)
    const providerTransactionId = obj?.id;

    // providerId / order id / transaction id
    const providerId = obj?.order?.id ?? obj?.id ?? null;

    // Only process successful TRANSACTION events (your business logic)
    if ((type === "TRANSACTION" || type === "transaction") && obj?.success) {
      const amount_cents = obj.amount_cents ?? obj.data?.amount_cents;
      // find plan by amount (optional)
      const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.cents, amount_cents));

      if (!plan) {
        // Return 200 so Paymob won't keep retrying, but inform in logs
        return NextResponse.json({ message: "Invalid plan amount" });
      }

      // Build lookup order: localSubscriptionId > providerPendingId > providerId
      let lookupWhere = null;
      if (localSubscriptionId) {
        lookupWhere = eq(subscriptions.id, localSubscriptionId);
      } else if (providerPendingId) {
        lookupWhere = eq(subscriptions.providerPendingId, providerPendingId);
      } else if (providerId) {
        lookupWhere = eq(subscriptions.providerId, String(providerId));
      }

      if (!lookupWhere) {
        console.warn(
          "Webhook: no mapping id provided in payload to identify subscription",
          {
            localSubscriptionId,
            providerPendingId,
            providerId,
          }
        );
        return NextResponse.json({
          message: "No mapping id found; nothing updated",
        });
      }

      // Try to fetch the existing subscription
      const [existingSub] = await db
        .select()
        .from(subscriptions)
        .where(lookupWhere)
        .limit(1);

      if (!existingSub) {
        console.warn("Webhook: subscription row not found for lookup", {
          localSubscriptionId,
          providerPendingId,
          providerId,
        });
        // Optionally store the payload in an "orphan_webhooks" table for manual reconcilation.
        return NextResponse.json({
          message: "Subscription not found for webhook mapping",
        });
      }

      // Build updates: attach provider ids and activate subscription
      const now = new Date();
      const renewalDate =
        existingSub.renewalDate ??
        new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const updates: any = {
        status: "active",
        startDate: existingSub.startDate ?? now,
        renewalDate,
      };

      if (providerPendingId) updates.providerPendingId = providerPendingId;
      if (providerTransactionId)
        updates.providerTransactionId = providerTransactionId;
      if (providerId) updates.providerId = String(providerId);

      // Update price if amount_cents present
      if (typeof amount_cents === "number") {
        updates.price_cents = amount_cents;
      }

      updates.canceledAt = null;
      updates.endDate = null;

      // Execute update
      const [updatedSub] = await db
        .update(subscriptions)
        .set(updates)
        .where(eq(subscriptions.id, existingSub.id))
        .returning();

      await db.insert(invoices).values({
        id: crypto.randomUUID(),
        subscriptionId: updatedSub.id,
        tenantId: updatedSub.tenantId,
        amountCents: updatedSub.price_cents,
        currency: plan.currency,
        issuedAt: new Date(),
        dueAt: updatedSub.renewalDate,
        paidAt: new Date(),
      } as Invoice);

      return NextResponse.json({
        message: "Subscription updated",
        subscription: updatedSub,
      });
    }

    return NextResponse.json({
      message: "Webhook processed (no action taken)",
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { message: "Webhook processing failed", error: String(err) },
      { status: 500 }
    );
  }
};
