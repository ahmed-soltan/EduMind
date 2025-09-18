// app/api/members/route.ts
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db, redis } from "@/db/conn";
import {
  tenantMembers,
  users,
  tenantRoles,
  rolePermission,
} from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { Permissions, TenantMemberContext } from "@/db/types";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";
import { getTenantMember } from "@/actions/get-tenant-member";
import { hasPermission } from "@/utils/has-permission";

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

    let tenantMember;
  try {
    tenantMember = await getTenantMember(session.user.id, tenant.id);
  } catch (err: any) {
          return NextResponse.json(
        { error: "Not a member of tenant" },
        { status: 403 }
      );
  }

  const allowed = await hasPermission( tenantMember.roleId , "members:manage");

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4) Fetch members list for the tenant (only required fields)
  const members = await db
    .select({
      id: tenantMembers.id,
      userId: tenantMembers.userId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      roleId: tenantMembers.roleId,
      roleName: tenantRoles.roleName,
      isActive: tenantMembers.isActive,
      joinedAt: tenantMembers.joinedAt,
    })
    .from(tenantMembers)
    .leftJoin(users, eq(users.id, tenantMembers.userId))
    .leftJoin(tenantRoles, eq(tenantRoles.id, tenantMembers.roleId))
    .where(eq(tenantMembers.tenantId, tenant.id));

  return NextResponse.json(members);
};
