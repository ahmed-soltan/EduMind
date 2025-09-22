import crypto from "crypto";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db, redis } from "@/db/conn";
import {
  tenantRoles,
  rolePermission,
  tenantMembers,
  permissions,
} from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";
import { getTenantMember } from "@/actions/get-tenant-member";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) => {
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

  try {
    const { roleId } = await params;
    const currentMember = await getTenantMember(session.user.id, tenant.id);

    // Check permission to manage settings
    const allowed = await hasPermission(currentMember.roleId, "tenant:manage");
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get role details with permissions
    const [role] = await db
      .select({
        id: tenantRoles.id,
        roleName: tenantRoles.roleName,
        roleDescription: tenantRoles.roleDescription,
        isDefault: tenantRoles.isDefault,
      })
      .from(tenantRoles)
      .where(
        and(
          eq(tenantRoles.id, roleId),
          eq(tenantRoles.tenantId, currentMember.tenantId)
        )
      );

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Get role permissions
    const permissionsData = await db
      .select({
        id: permissions.id,
        permissionName: permissions.name,
      })
      .from(rolePermission)
      .leftJoin(permissions, eq(rolePermission.permissionId, permissions.id))
      .where(eq(rolePermission.roleId, roleId));

    return NextResponse.json({
      ...role,
      permissions: permissionsData,
    });
  } catch (error) {
    console.error("Error fetching role details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { roleId } = await params;
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

    // Check if role exists and belongs to the same tenant
    const [role] = await db
      .select()
      .from(tenantRoles)
      .where(
        and(
          eq(tenantRoles.id, roleId),
          eq(tenantRoles.tenantId, currentMember.tenantId)
        )
      );

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    // assume `redis` is an Upstash Redis instance: import { Redis } from "@upstash/redis"

    console.log({permissions})

    await Promise.all([
      await updateRoleInRedis({
        tenantId: tenant.id,
        roleId,
        roleName,
        description,
        permissionsCount: permissions.length, // <- this will set count based on length
      }),
      // Update role basic information
      await db
        .update(tenantRoles)
        .set({
          roleName: role.isDefault ? role.roleName : roleName, // Don't change default role names
          roleDescription: description || null,
          updatedAt: new Date(),
        })
        .where(eq(tenantRoles.id, roleId)),

      await db.delete(rolePermission).where(eq(rolePermission.roleId, roleId)),

      await db.insert(rolePermission).values(
        permissions.map((permission: string) => ({
          id: crypto.randomUUID(),
          roleId,
          permissionId: permission,
          createdAt: new Date(),
        }))
      ),
    ]);

    return NextResponse.json({
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) => {
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

  try {
    const { roleId } = await params;
    const currentMember = await getTenantMember(session.user.id, tenant.id);

    // Check permission to manage settings
    const allowed = await hasPermission(currentMember.roleId, "tenant:manage");
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if role exists and belongs to the same tenant
    const [role] = await db
      .select()
      .from(tenantRoles)
      .where(
        and(
          eq(tenantRoles.id, roleId),
          eq(tenantRoles.tenantId, currentMember.tenantId)
        )
      );

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Prevent deletion of default roles
    if (role.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default roles" },
        { status: 400 }
      );
    }

    // Check if any members are assigned to this role
    const [membersWithRole] = await db
      .select({ count: tenantMembers.id })
      .from(tenantMembers)
      .where(
        and(
          eq(tenantMembers.roleId, roleId),
          eq(tenantMembers.tenantId, currentMember.tenantId)
        )
      );

    if (membersWithRole) {
      return NextResponse.json(
        { error: "Cannot delete role that is assigned to members" },
        { status: 400 }
      );
    }

    // Delete role permissions first
    await Promise.all([
      await db.delete(rolePermission).where(eq(rolePermission.roleId, roleId)),
      await redis.del(`tenant:${tenant.id}:roles`),
      await db.delete(tenantRoles).where(eq(tenantRoles.id, roleId)),
    ]);

    return NextResponse.json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

// PATCH handler (or helper)
async function updateRoleInRedis({
  tenantId,
  roleId,
  roleName,
  description,
  isDefault,
  // either pass permissions (array) OR permissionsCount (number|string)
  permissions,
  permissionsCount,
}: {
  tenantId: string;
  roleId: string;
  roleName?: string;
  description?: string | null;
  isDefault?: boolean;
  permissions?: unknown[]; // optional array of permissions
  permissionsCount?: number | string; // optional explicit count
}) {
  const redisKey = `tenant:${tenantId}:roles`;
  const raw: unknown = await redis.get(redisKey);

  // normalize to array safely
  let roles: any[] = [];
  if (raw == null) {
    roles = [];
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      roles = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // corrupt value like "[object Object]" -> log and fallback to empty
      console.warn("Invalid JSON in redis key, resetting:", redisKey, raw);
      roles = [];
    }
  } else if (Array.isArray(raw)) {
    roles = raw as any[];
  } else if (typeof raw === "object") {
    // some clients may already return parsed objects; ensure it's an array
    roles = Array.isArray(raw as any) ? (raw as any) : [];
  } else {
    roles = [];
  }

  const index = roles.findIndex((r) => r.id === roleId);
  if (index === -1) {
    // not found — optionally throw or return
    return false;
  }

  console.log({ permissionsCount });

  // apply updates
  roles[index] = {
    ...roles[index],
    roleName: isDefault
      ? roles[index].roleName
      : (roleName ?? roles[index].roleName),
    roleDescription: description ?? null,
    permissionsCount,
  };

  console.log({ role: roles[index] });

  // write back as JSON (always stringify to avoid "[object Object]")
  await redis.set(redisKey, JSON.stringify(roles), { ex: 60 * 60 });
  return true;
}
