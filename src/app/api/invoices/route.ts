import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import { getUserSession } from "@/utils/get-user-session";
import { invoices, plans, subscriptions, tenants } from "@/db/schema";
import { getTenantByUserId } from "@/actions/get-tenant-by-user-id";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subdomain = extractSubdomain(req);

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 400 });
  }

  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const invoicesData = await db
    .select({
      id: invoices.id,
      amountCents: invoices.amountCents,
      currency: invoices.currency,
      issuedAt: invoices.issuedAt,
      paidAt: invoices.paidAt,
      status: subscriptions.status,
      plan: plans.name,
      billingCycle: subscriptions.billingCycle,
    })
    .from(invoices)
    .leftJoin(subscriptions, eq(invoices.subscriptionId, subscriptions.id))
    .leftJoin(plans, eq(subscriptions.planId, plans.id))
    .where(eq(invoices.tenantId, tenant.id));

  return NextResponse.json(invoicesData);
};
