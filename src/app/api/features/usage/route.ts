import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db, redis } from "@/db/conn";
import { PlanLimits } from "@/db/types";
import { countRows } from "@/utils/can-create-feature";
import { getUserSession } from "@/utils/get-user-session";
import { extractSubdomain } from "@/utils/extract-subdomain";
import {
  deck,
  documents,
  flashcards,
  quizzes,
  subscriptions,
} from "@/db/schema";

import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

const featureTables: Record<string, { table: any | null; name: string }> = {
  quizzes: { table: quizzes, name: "quizzes" },
  decks: { table: deck, name: "decks" },
  flashcards: { table: flashcards, name: "flashcards" },
  documents: { table: documents, name: "documents" },
  teams: { table: null, name: "teams" }, // boolean-only feature
};

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subdomain = extractSubdomain(req)

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 400 });
  }

  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.tenantId, tenant.id),
      eq(subscriptions.status, "active")
    ),
    with: { plan: true },
  });

  if (!subscription) {
    return NextResponse.json(
      { error: "No active subscription" },
      { status: 403 }
    );
  }

  const planLimits = (await redis.get<PlanLimits[]>("plan_limits")) ?? [];
  const limitsForPlan = planLimits.filter(
    (l) => l.planId === subscription.planId
  );

  const limitsMap = limitsForPlan.reduce<Record<string, { limit: number | null; available: boolean }>>(
    (acc, l) => {
      acc[l.feature] = {
        limit: l.limit ?? null,
        available: typeof (l as any).available === "boolean" ? !!(l as any).available : true,
      };
      return acc;
    },
    {}
  );

  const { searchParams } = new URL(req.url);
  const featuresParam = searchParams.get("features");
  const requestedFeatures = featuresParam
    ? featuresParam.split(",").map((f) => f.trim()).filter(Boolean)
    : Object.keys(featureTables);

  const featuresToCompute = requestedFeatures.filter((f) => featureTables[f]);

  const results: Record<string, any> = {};

  await Promise.all(
    featuresToCompute.map(async (feature) => {
      const info = featureTables[feature];
      const limitEntry = limitsMap[feature];

      const available = limitEntry ? limitEntry.available : false;
      const limitValue = limitEntry ? limitEntry.limit : null;

      const hasUsageMetric = Boolean(info.table);

      let usage: number | null = null;
      if (hasUsageMetric) {
        usage = await countRows(info.table, tenant.id);
      }

      let canCreate: boolean;
      if (!available) {
        canCreate = false;
      } else if (limitValue === null) {
        // unlimited
        canCreate = true;
      } else {
        // numeric limit
        if (hasUsageMetric) {
          canCreate = (usage ?? 0) < limitValue;
        } else {
          // no usage metric but numeric limit exists — treat feature as available
          canCreate = true;
        }
      }

      results[feature] = {
        available,
        canCreate,
        usage,
        limit: limitValue === null ? "∞" : limitValue,
      };
    })
  );

  return NextResponse.json(results);
};
