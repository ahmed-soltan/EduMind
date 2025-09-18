import { db } from "@/db/conn";
import { pendingInvitations, tenantMembers, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUserSession } from "@/utils/get-user-session";
import { rootDomain } from "@/lib/utils";

export const POST = async (req: NextRequest) => {
  try {
    const { token, subdomain } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // TODO: Look up invitation in pendingInvitations table
    // For now, we'll create a mock flow

    // Get current user session (if any)
    const session = await getUserSession();

    if (!session.isAuthenticated) {
      // User is not logged in, store the token for later use after login/signup
      return NextResponse.json({
        message: "Please log in or sign up to accept the invitation",
        requiresAuth: true,
        token, // Include token for redirect handling
      });
    }


    const [pendingInvitation] = await db
      .select({
        id: pendingInvitations.id,
        email: pendingInvitations.email,
        tenantId: pendingInvitations.tenantId,
        roleId: pendingInvitations.roleId,
        invitedBy: pendingInvitations.invitedBy,
        createdAt: pendingInvitations.createdAt,
        expiresAt: pendingInvitations.expiresAt,
      })
      .from(pendingInvitations)
      .where(eq(pendingInvitations.token, token));

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

    // Check if the authenticated user's email matches the invitation email
    const [existingUser] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!existingUser || existingUser.email !== pendingInvitation.email) {
      return NextResponse.json(
        { error: "This invitation is not for your account" },
        { status: 403 }
      );
    }

    // Check if user is already a member of the tenant
    const [existingMember] = await db
      .select({ id: tenantMembers.id })
      .from(tenantMembers)
      .where(
        and(
          eq(tenantMembers.userId, existingUser.id),
          eq(tenantMembers.tenantId, pendingInvitation.tenantId)
        )
      );

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this tenant" },
        { status: 403 }
      );
    }

    await db.transaction(async (tx) => {
      // Add user to tenantMembers
      await tx.insert(tenantMembers).values({
        id: crypto.randomUUID(),
        userId: existingUser.id,
        tenantId: pendingInvitation.tenantId,
        roleId: pendingInvitation.roleId,
        invitedBy: pendingInvitation.invitedBy,
        joinedAt: new Date(),
      });
      await tx
        .update(users)
        .set({ lastActiveTenantSubdomain: subdomain! })
        .where(eq(users.id, existingUser.id));
      // Delete the invitation (mark as used)
      await tx
        .delete(pendingInvitations)
        .where(eq(pendingInvitations.id, pendingInvitation.id));
    });

    const res = NextResponse.json(
      {
        message: "Invitation accepted successfully",
      },
      { status: 201 }
    );
    res.cookies.set("subdomain", subdomain!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      domain: `.${rootDomain}`,
    });

    // Mock response for now
    return res
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
