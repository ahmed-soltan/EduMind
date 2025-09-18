import { db } from "@/db/conn";
import { pendingInvitations, tenantMembers, tenantRoles, tenants, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const tenantSubdomain = searchParams.get("tenant");

  if (!token || !tenantSubdomain) {
    return NextResponse.json(
      { error: "Token and tenant are required" },
      { status: 400 }
    );
  }

  try {
    // TODO: Validate token from pendingInvitations table
    // For now, we'll decode the token and validate the tenant exists

    // Validate tenant exists
    const [tenant] = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        subdomain: tenants.subdomain,
      })
      .from(tenants)
      .where(eq(tenants.subdomain, tenantSubdomain));

    if (!tenant) {
      return NextResponse.json(
        { error: "Invalid tenant", isValid: false },
        { status: 404 }
      );
    }

    const [pendingInvitation] = await db
      .select({
        id: pendingInvitations.id,
        email: pendingInvitations.email,
        tenantId: pendingInvitations.tenantId,
        roleId: pendingInvitations.roleId,
        createdAt: pendingInvitations.createdAt,
        invitedBy: pendingInvitations.invitedBy,
        expiresAt: pendingInvitations.expiresAt,
      })
      .from(pendingInvitations)
      .where(eq(pendingInvitations.token, token));

    const [role] = await db
      .select({ name: tenantRoles.roleName })
      .from(tenantRoles)
      .where(eq(tenantRoles.id, pendingInvitation.roleId));

    const [inviter] = await db
      .select({ firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.id, pendingInvitation.invitedBy));

    if (!pendingInvitation) {
      return NextResponse.json(
        { error: "Invalid invitation", isValid: false },
        { status: 404 }
      );
    }

    if (pendingInvitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired", isValid: false, isExpired: true },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, pendingInvitation.email));

    const userExists = !!existingUser;

    return NextResponse.json({
      ...pendingInvitation,
      userExists,
      isValid: true,
      role: role.name,
      inviterName: `${inviter.firstName} ${inviter.lastName}`,
      tenantName: tenant.name,
      subdomain: tenant.subdomain,
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
