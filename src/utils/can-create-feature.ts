// utils/can-create-feature.ts
import { and, eq, sql } from "drizzle-orm";
import { db, redis } from "@/db/conn";
import {
  deck,
  documents,
  flashcards,
  quizzes,
  subscriptions,
} from "@/db/schema";
import { PlanLimits } from "@/db/types";

/**
 * Return shape:
 * - usage: number | null  -> null means "no usage applies" (boolean-only feature)
 * - limit: number | null -> null means "not applicable" or "unlimited" handled below
 * - available: boolean   -> whether the plan enables the feature at all
 */
export type FeatureCheckResult = {
  canCreate: boolean;
  usage: number | null;
  limit: number | null | typeof Infinity;
  available: boolean;
};

export async function canCreateFeature(
  tenantId: string,
  feature: string
): Promise<FeatureCheckResult> {
  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.tenantId, tenantId),
      eq(subscriptions.status, "active")
    ),
    with: { plan: true },
  });

  if (!subscription) {
    return { canCreate: false, usage: 0, limit: 0, available: false };
  }

  // load plan limits from redis (or db fallback if you prefer)
  const planLimitsCached = (await redis.get<PlanLimits[]>("plan_limits")) ?? [];

  const planLimit = planLimitsCached.find(
    (p) => p.planId === subscription.planId && p.feature === feature
  );

  // If no planLimit entry => feature not available for this plan
  if (!planLimit) {
    return { canCreate: false, usage: null, limit: null, available: false };
  }

  // If schema includes explicit available flag, prefer it:
  // (PlanLimits type should include `available?: boolean` for this branch)
  if (typeof (planLimit as any).available === "boolean") {
    const available = Boolean((planLimit as any).available);

    if (!available) {
      return { canCreate: false, usage: null, limit: null, available: false };
    }

    // available === true
    if (planLimit.limit === null) {
      return { canCreate: true, usage: await getUsage(tenantId, feature), limit: Infinity, available: true };
    }

    // numeric limit (could be undefined or number)
    if (typeof planLimit.limit === "number") {
      const usage = await getUsage(tenantId, feature);
      // if usage is null (meaning feature has no usage metric), we still allow because available=true
      if (usage === null) {
        return { canCreate: true, usage: null, limit: planLimit.limit, available: true };
      }
      return { canCreate: usage < planLimit.limit, usage, limit: planLimit.limit, available: true };
    }

    // fallback - treat as available & unlimited
    return { canCreate: true, usage: await getUsage(tenantId, feature), limit: Infinity, available: true };
  }

  // Legacy behavior (no `available` column): use numeric limit semantics
  // Convention in legacy code: limit === null => unlimited, otherwise numeric
  if (planLimit.limit === null) {
    return { canCreate: true, usage: await getUsage(tenantId, feature), limit: Infinity, available: true };
  }

  // If the feature has no usage metric (getUsage returns null), treat it as boolean available
  const usage = await getUsage(tenantId, feature);
  if (usage === null) {
    // planLimit exists but has numeric limit (we'll use logic that if limit === 0 -> disabled?).
    // Safer default: if limit is number, and usage not applicable, just return available = true
    return { canCreate: true, usage: null, limit: planLimit.limit ?? null, available: true };
  }

  return {
    canCreate: usage < (planLimit.limit ?? 0),
    usage,
    limit: planLimit.limit ?? 0,
    available: true,
  };
}

/**
 * countRows (unchanged) - returns number
 */
export async function countRows(
  table: any,
  tenantId: string,
  column = "tenantId"
) {
  const result = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(table)
    .where(eq((table as any)[column], tenantId));

  return result[0]?.count ?? 0;
}

/**
 * getUsage now returns number | null
 * - returns null for boolean-only features (no meaningful count)
 */
export async function getUsage(tenantId: string, feature: string): Promise<number | null> {
  switch (feature) {
    case "documents":
      return await countRows(documents, tenantId);

    case "quizzes":
      return await countRows(quizzes, tenantId);

    case "decks":
      return await countRows(deck, tenantId);

    case "flashcards":
      return await countRows(flashcards, tenantId);

    case "teams":
      // teams is boolean-only: there's no "count" usage
      return null;

    case "streak":
      // streak is not a simple count; return null (or implement your own logic)
      return null;

    default:
      throw new Error(`Unknown feature: ${feature}`);
  }
}
