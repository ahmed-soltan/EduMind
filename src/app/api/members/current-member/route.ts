// app/api/members/current-member/route.ts
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db, redis } from "@/db/conn";
import {
  tenantMembers,
  subscriptions,
  rolePermission,
  users,
  tenants,
} from "@/db/schema";

import { getUserSession } from "@/utils/get-user-session";
import { Permissions, TenantMemberContext } from "@/db/types";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

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

  const tenantId = tenant.id;

  // Use userId + tenantId to build the cache key (unique per membership)
  const initialCacheKey = `ctx:tenantMember:${session.user.id}:${tenantId}`;

  // Try fast path: cached full context
  const cachedInitial = await redis.get<TenantMemberContext | null>(
    initialCacheKey
  );
  if (cachedInitial) return NextResponse.json(cachedInitial);

  // Cold path: load tenant member + (role permissions via left join) + user + subscription
  const rows = await db
    .select({
      tenantMemberId: tenantMembers.id,
      tenantId: tenantMembers.tenantId,
      roleId: tenantMembers.roleId,
      isActive: tenantMembers.isActive,
      subscriptionId: subscriptions.id,
      planId: subscriptions.planId,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      permissionId: rolePermission.permissionId, // may be null if no permission rows
    })
    .from(tenantMembers)
    .leftJoin(
      subscriptions,
      and(
        eq(tenantMembers.tenantId, subscriptions.tenantId),
        eq(subscriptions.status, "active")
      )
    )
    .leftJoin(users, eq(users.id, tenantMembers.userId))
    .leftJoin(rolePermission, eq(rolePermission.roleId, tenantMembers.roleId))
    .where(
      and(
        eq(tenantMembers.userId, session.user.id),
        eq(tenantMembers.tenantId, tenantId)
      )
    );

  if (!rows.length) {
    return NextResponse.json(
      { error: "Not a member of the requested tenant" },
      { status: 403 }
    );
  }

  const first = rows[0];
  if (!first.isActive) {
    return NextResponse.json({ error: "Inactive member" }, { status: 403 });
  }

  // Permission ids that came from the join (may be empty)
  const permissionIdsFromJoin = Array.from(
    new Set(rows.map((r) => r.permissionId).filter(Boolean))
  ) as string[];

  // 1) Try to get role -> permission ids from redis (faster)
  const rolePermKey = `role:${first.roleId}:permissions`;
  let rolePermissionIds = await redis.get<string[]>(rolePermKey);

  if (!rolePermissionIds || rolePermissionIds.length === 0) {
    // If redis doesn't have them, use permission ids from the join (if present).
    // If join didn't contain them (e.g., you didn't join role_permission), query DB directly.
    if (permissionIdsFromJoin.length > 0) {
      rolePermissionIds = permissionIdsFromJoin;
    } else {
      // DB fallback: query rolePermission table directly
      const rpRows = await db
        .select({ permissionId: rolePermission.permissionId })
        .from(rolePermission)
        .where(eq(rolePermission.roleId, first.roleId!));

      rolePermissionIds = rpRows.map((r) => r.permissionId);
    }

    // Cache role -> permission ids for future requests (if you expect roles to be stable)
    await redis.set(rolePermKey, rolePermissionIds, { ex: 60 * 60 }); // 1 hour TTL (tune as needed)
  }

  // 2) Resolve permission objects from global permissions cache
  const allPermissions = (await redis.get<Permissions[]>("permissions")) ?? [];

  // Build the list of permission objects for this tenant-member
  const tenantMemberPermissions = allPermissions.filter((p) =>
    rolePermissionIds?.includes(p.id)
  );

  const context: TenantMemberContext = {
    id: first.tenantMemberId,
    tenantId: first.tenantId,
    roleId: first.roleId!,
    isActive: Boolean(first.isActive),
    subscriptionId: first.subscriptionId ?? null,
    planId: first.planId ?? null,
    firstName: first.firstName ?? null,
    lastName: first.lastName ?? null,
    email: first.email ?? null,
    permissions: tenantMemberPermissions,
  };

  // Cache per-user-per-tenant context (use a TTL appropriate for your app)
  await redis.set(initialCacheKey, context, { ex: 60 * 60 });

  return NextResponse.json(context);
};
