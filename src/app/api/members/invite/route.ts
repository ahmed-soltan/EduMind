import { db } from "@/db/conn";
import { tenantMembers, tenantRoles, users, tenants, pendingInvitations } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";
import { getTenantMember } from "@/actions/get-tenant-member";
import { Resend } from "resend";
import {
  InviteMemberEmailTemplate,
  generateInviteEmailText,
} from "@/lib/email-utils";
import { APP_DOMAIN, protocol, rootDomain } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = async (req: NextRequest) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, roleId } = await req.json();

    if (!email || !roleId) {
      return NextResponse.json(
        { error: "Email and role are required" },
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

    let currentMember;
    try {
      currentMember = await getTenantMember(session.user.id, tenant.id);
    } catch (err: any) {
      if (
        err.message === "NOT_A_MEMBER" ||
        err.message === "NOT_A_MEMBER_OF_REQUESTED_TENANT"
      ) {
        return NextResponse.json(
          { error: "Not a member of tenant" },
          { status: 403 }
        );
      }
      console.error("getTenantMember error:", err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    if (!currentMember) {
      return NextResponse.json(
        { error: "Not a member of any tenant" },
        { status: 403 }
      );
    }

    // Check permission to manage members
    const allowed = await hasPermission(currentMember.roleId, "members:manage");
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate that the role exists and belongs to the same tenant
    const [role] = await db
      .select({
        id: tenantRoles.id,
        roleName: tenantRoles.roleName,
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
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists (but don't add them to team yet)
    const [existingUser] = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      // Check if user is already a member of this tenant
      const [existingMember] = await db
        .select({ id: tenantMembers.id })
        .from(tenantMembers)
        .where(
          and(
            eq(tenantMembers.userId, existingUser.id),
            eq(tenantMembers.tenantId, currentMember.tenantId)
          )
        );

      if (existingMember) {
        return NextResponse.json(
          { error: "User is already a member of this team" },
          { status: 400 }
        );
      }
    }

    // Generate invitation token for both existing and new users
    const inviteToken = crypto.randomBytes(32).toString("hex");
    
    // Create unified invitation link for both user types
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${inviteToken}&tenant=${tenant.subdomain}`;

    const emailProps = {
      inviterName:
        `${currentMember.firstName || ""} ${
          currentMember.lastName || ""
        }`.trim() || "Team Admin",
      inviterEmail: currentMember.email || "",
      tenantName: tenant.name || "the team",
      roleName: role.roleName,
      inviteLink,
      isExistingUser: !!existingUser, // For email template context only
    };

    try {
      console.time("resend.send.invitation");
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "EduMind <noreply@edumind.app>",
        to: [email],
        subject: `You're invited to join ${
          tenant.name || "the"
        } team on EduMind`,
        react: InviteMemberEmailTemplate(emailProps),
        text: generateInviteEmailText(emailProps),
      });
      console.timeEnd("resend.send.invitation");

      // TODO: Store invitation in database
      // You should create a pendingInvitations table with:
      // token, email, tenantId, roleId, invitedBy, expiresAt, createdAt
      await db.insert(pendingInvitations).values({
        id: crypto.randomUUID(),
        token: inviteToken,
        email,
        tenantId: currentMember.tenantId,
        roleId,
        invitedBy: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
      });

      return NextResponse.json({
        message: `Invitation sent to ${email}`,
        email: email,
        role: role.roleName,
        userExists: !!existingUser,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      return NextResponse.json(
        { error: "Failed to send invitation email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
