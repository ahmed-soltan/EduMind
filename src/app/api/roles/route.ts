import { countRows } from "@/utils/can-create-feature";
import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db, redis } from "@/db/conn";
import { Permissions, TenantRole } from "@/db/types";
import { hasPermission } from "@/utils/has-permission";
import { tenantRoles, rolePermission } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { extractSubdomain } from "@/utils/extract-subdomain";

import { getTenantMember } from "@/actions/get-tenant-member";
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

  console.log({ tenant });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const tenantId = tenant.id;
  const rolesCacheKey = `tenant:${tenantId}:roles`;

  let tenantMember;
  try {
    tenantMember = await getTenantMember(session.user.id, tenant.id);
  } catch (err: any) {
          return NextResponse.json(
        { error: "Not a member of tenant" },
        { status: 403 }
      );
  }

  const allowed = await hasPermission(tenantMember.roleId, "members:manage");

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Now authorized -> fetch roles (from cache if available)
  let roles = await redis.get<TenantRole[] | null>(rolesCacheKey);
  if (!roles || roles.length === 0) {
    // read from DB and cache result
    roles = await db
      .select({
        id: tenantRoles.id,
        tenantId: tenantRoles.tenantId,
        roleName: tenantRoles.roleName,
        roleDescription: tenantRoles.roleDescription,
        isDefault: tenantRoles.isDefault,
        isProtected: tenantRoles.isProtected,
        createdAt: tenantRoles.createdAt,
        updatedAt: tenantRoles.updatedAt,
        permissionsCount: sql<number>`COUNT(${rolePermission.roleId})`,
      })
      .from(tenantRoles)
      .leftJoin(rolePermission, eq(tenantRoles.id, rolePermission.roleId))
      .where(eq(tenantRoles.tenantId, tenantId))
      .groupBy(
        tenantRoles.id,
        tenantRoles.tenantId,
        tenantRoles.roleName,
        tenantRoles.roleDescription,
        tenantRoles.isDefault,
        tenantRoles.isProtected,
        tenantRoles.createdAt,
        tenantRoles.updatedAt
      );

    // cache for 1 hour (tune as needed)
    await redis.set(rolesCacheKey, roles, { ex: 60 * 60 });
  }

  return NextResponse.json(roles);
};

export const POST = async (req: NextRequest) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { roleName, description, permissions } = await req.json();

    if (!roleName || !permissions || permissions.length === 0) {
      return NextResponse.json(
        { error: "Role name and permissions are required" },
        { status: 400 }
      );
    }

    const subdomain = extractSubdomain(req);

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain not found" },
        { status: 400 }
      );
    }

    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const currentMember = await getTenantMember(session.user.id, tenant.id);

    // Check permission to manage settings
    const allowed = await hasPermission(currentMember.roleId, "tenant:manage");
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create the role
    const roleId = crypto.randomUUID();

    await db.insert(tenantRoles).values({
      id: roleId,
      tenantId: currentMember.tenantId,
      roleName,
      roleDescription: description,
      isDefault: false,
      createdAt: new Date(),
    });

    const currentTenantRolesRaw = await redis.get<string>(
      `tenant:${currentMember.tenantId}:roles`
    );

    let currentTenantRoles: any[] = [];
    if (currentTenantRolesRaw) {
      try {
        currentTenantRoles = JSON.parse(currentTenantRolesRaw);
      } catch (e) {
        console.error("Failed to parse tenant roles from Redis", e);
        currentTenantRoles = [];
      }
    }

    const newRole = {
      id: roleId,
      tenantId: currentMember.tenantId,
      roleName,
      roleDescription: description,
      isDefault: false,
      isProtected: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Push and save back
    currentTenantRoles.push(newRole);

    await redis.set(
      `tenant:${currentMember.tenantId}:roles`,
      JSON.stringify(currentTenantRoles),
      { ex: 60 * 60 }
    );

    // Add permissions to the role
    if (permissions.length > 0) {
      await db.insert(rolePermission).values(
        permissions.map((permission: Permissions) => ({
          id: crypto.randomUUID(),
          roleId,
          permissionId: permission,
          createdAt: new Date(),
        }))
      );
    }

    return NextResponse.json({
      message: "Role created successfully",
      roleId,
    });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
