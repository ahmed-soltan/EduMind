import { db } from "@/db/conn";
import { settings, tenantMembers, tenants, users } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantMember } from "@/actions/get-tenant-member";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

  const [profile] = await db
    .select()
    .from(settings)
    .where(
      and(
        eq(settings.tenantId, tenantMember.tenantId),
      )
    );

  if (!profile) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
};

export const PATCH = async (request: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nickName, bio, avatar, timezone, interests } = body;

    const subdomain = extractSubdomain(request);

    const [tenant] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.subdomain, subdomain!));

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    let tenantMember;
    try {
      tenantMember = await getTenantMember(session.user.id, tenant.id);
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

    if (!tenantMember) {
      return NextResponse.json(
        { message: "Tenant member not found" },
        { status: 404 }
      );
    }

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(settings)
      .where(
        and(
          eq(settings.tenantId, tenantMember.tenantId),
          eq(settings.tenantMemberId, tenantMember.id)
        )
      );

    let updatedProfile;

    if (existingProfile) {
      // Update existing profile
      [updatedProfile] = await db
        .update(settings)
        .set({
          nickName,
          bio,
          avatar,
          timezone,
          interests,
        })
        .where(
          and(
            eq(settings.tenantId, tenantMember.tenantId),
            eq(settings.tenantMemberId, tenantMember.id)
          )
        )
        .returning();
    } else {
      // Create new profile
      [updatedProfile] = await db
        .insert(settings)
        .values({
          id: randomUUID(),
          tenantId: tenantMember.tenantId,
          tenantMemberId: tenantMember.id,
          nickName,
          bio,
          avatar,
          timezone,
          interests,
        })
        .returning();
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
