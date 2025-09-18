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

    const redisKey = `tenant:${tenant.id}:roles`;

    // Find index of role inside the array
    const roles = (await redis.json.get(redisKey)) as any[];
    if (roles) {
      const index = roles.findIndex((r) => r.id === roleId);
      if (index !== -1) {
        await redis.json.set(
          redisKey,
          `$[${index}].roleName`,
          role.isDefault ? roles[index].roleName : roleName
        );
        await redis.json.set(
          redisKey,
          `$[${index}].roleDescription`,
          description || null
        );
      }
    }

    await Promise.all([
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
