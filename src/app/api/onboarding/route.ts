import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { db, redis } from "@/db/conn";
import { rootDomain } from "@/lib/utils";
import { getUserSession } from "@/utils/get-user-session";
import {
  settings,
  streaks,
  tenantMembers,
  tenantRoles,
  tenants,
  users,
} from "@/db/schema";

async function createTenantWithRoles(
  body: { name: string; subdomain: string; tenantId: string },
  session: { user: { id: string } }
) {
  return db.transaction(async (tx) => {
    const [t] = await tx
      .update(tenants)
      .set({
        name: body.name,
        subdomain: body.subdomain,
      })
      .returning({ subdomain: tenants.subdomain });

    const ownerRoleId = crypto.randomUUID();
    const adminRoleId = crypto.randomUUID();
    const memberRoleId = crypto.randomUUID();
    const now = new Date();

    await tx.insert(tenantRoles).values([
      {
        id: ownerRoleId,
        tenantId: body.tenantId,
        roleName: "owner",
        roleDescription: "Tenant owner — full access",
        isDefault: false,
        isProtected: true,
        createdAt: now,
      },
      {
        id: adminRoleId,
        tenantId: body.tenantId,
        roleName: "admin",
        roleDescription: "Admin — manage members & settings",
        isDefault: false,
        isProtected: true,
        createdAt: now,
      },
      {
        id: memberRoleId,
        tenantId: body.tenantId,
        roleName: "member",
        roleDescription: "Default member role",
        isDefault: true,
        isProtected: true,
        createdAt: now,
      },
    ]);

    const [tenantMember] = await tx
      .insert(tenantMembers)
      .values({
        id: crypto.randomUUID(),
        tenantId: body.tenantId,
        userId: session.user.id,
        roleId: ownerRoleId,
        joinedAt: now,
        invitedBy: null,
        isActive: true,
      })
      .returning({ id: tenantMembers.id });

    return {
      tenantMemberId: tenantMember.id,
    };
  });
}

export const POST = async (req: NextRequest) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // check subdomain
  const [existingSubdomain] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.subdomain, body.subdomain));

  if (existingSubdomain) {
    return NextResponse.json(
      { message: "Subdomain already exists" },
      { status: 400 }
    );
  }

  const { tenantMemberId } = await createTenantWithRoles(
    { name: body.name, subdomain: body.subdomain, tenantId: body.tenantId },
    session
  );

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, body.tenantId));

  // create default settings + streaks + update user
  await Promise.all([
    db.insert(settings).values({
      id: crypto.randomUUID(),
      tenantId: body.tenantId,
      tenantMemberId,
      nickName: body.nickName,
      bio: body.bio,
      interests: body.interests,
    }),
    db
      .update(users)
      .set({ hasOnboarded: true, lastActiveTenantSubdomain: body.subdomain })
      .where(eq(users.id, session.user.id)),
    db.insert(streaks).values({
      id: crypto.randomUUID(),
      tenantId: body.tenantId,
      tenantMemberId,
      tz: "UTC",
    }),
    redis.set(`tenant:${body.subdomain}`, tenant),
  ]);
  const res = NextResponse.json({
    message: "Onboarding successful",
    subdomain: body.subdomain,
  });

  res.cookies.set("subdomain", body.subdomain!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
    domain: `.${rootDomain}`,
  });

  return res;
};
