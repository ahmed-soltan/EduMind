import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getTenantMember } from "@/actions/get-tenant-member";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

import { db } from "@/db/conn";
import { userActivities } from "@/db/schema";
import { hasPermission } from "@/utils/has-permission";
import { getUserSession } from "@/utils/get-user-session";
import { extractSubdomain } from "@/utils/extract-subdomain";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  const limit = req.nextUrl.searchParams.get("limit");

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

  let tenantMember;
  try {
    tenantMember = await getTenantMember(session.user.id, tenant.id);
  } catch (err: any) {
          return NextResponse.json(
        { error: "Not a member of tenant" },
        { status: 403 }
      );
  }

  // Check permission to view all activities

  const allowed = await hasPermission(tenantMember.roleId, "activity:view_all");
  let activities;

  if (!allowed) {
    if (limit) {
      activities = await db
        .select()
        .from(userActivities)
        .where(
          and(
            eq(userActivities.tenantId, tenantMember.tenantId),
            eq(userActivities.tenantMemberId, tenantMember.id)
          )
        )
        .orderBy(sql`${userActivities.activityDate} desc nulls first`)
        .limit(parseInt(limit));

      activities.reverse();
    } else {
      activities = await db
        .select()
        .from(userActivities)
        .where(
          and(
            eq(userActivities.tenantId, tenantMember.tenantId),
            eq(userActivities.tenantMemberId, tenantMember.id)
          )
        );
    }
  } else {
    if (limit) {
      activities = await db
        .select()
        .from(userActivities)
        .where(eq(userActivities.tenantId, tenantMember.tenantId))
        .orderBy(sql`${userActivities.activityDate} desc nulls first`)
        .limit(parseInt(limit));

      activities.reverse();
    } else {
      activities = await db
        .select()
        .from(userActivities)
        .where(eq(userActivities.tenantId, tenantMember.tenantId));
    }
  }

  return NextResponse.json(activities.reverse());
};
