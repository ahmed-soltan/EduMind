import { getTenantMember } from "@/actions/get-tenant-member";
import { db, redis } from "@/db/conn";
import {
  tenantMembers,
  tenants,
  users,
  tenantRoles,
  rolePermission,
  permissions,
  quizAttempts,
  flashcards,
  quizzes,
  deck,
  streaks,
  studyDays,
} from "@/db/schema";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId } = await params;
  const subdomain = extractSubdomain(req);

  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.subdomain, subdomain!));

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // ensure the requester is a member of this tenant
  let tenantMember;
  try {
    tenantMember = await getTenantMember(session.user.id, tenant.id);
  } catch (err: any) {
          return NextResponse.json(
        { error: "Not a member of tenant" },
        { status: 403 }
      );
  }

  if (!tenantMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // permission check: only members with members:manage can view
  const allowed = await hasPermission(tenantMember.roleId, "members:manage");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 1) Member + role + aggregated permissions (single fast query)
  const [memberDetails] = await db
    .select({
      id: tenantMembers.id,
      userId: tenantMembers.userId,
      tenantId: tenantMembers.tenantId,
      roleId: tenantMembers.roleId,
      isActive: tenantMembers.isActive,
      joinedAt: tenantMembers.joinedAt,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      createdAt: users.createdAt,
      roleName: tenantRoles.roleName,
      // aggregate permission names into an array (Postgres)
      permissions: sql<
        string[]
      >`COALESCE(array_agg(${permissions.name}), '{}')`,
    })
    .from(tenantMembers)
    .leftJoin(users, eq(users.id, tenantMembers.userId))
    .leftJoin(tenantRoles, eq(tenantRoles.id, tenantMembers.roleId))
    .leftJoin(rolePermission, eq(rolePermission.roleId, tenantMembers.roleId))
    .leftJoin(permissions, eq(permissions.id, rolePermission.permissionId))
    .where(eq(tenantMembers.id, memberId))
    .groupBy(tenantMembers.id, users.id, tenantRoles.id);

  if (!memberDetails || memberDetails.tenantId !== tenantMember.tenantId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // 2) Parallel smaller queries for related resources
  //    - We return counts + a small recent sample for each resource to keep payload small.
  //    - Adjust `limit` or returned columns as needed.

  const userId = memberDetails.userId;

  const quizzesCountQ = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(quizzes)
    .where(eq(quizzes.createdBy, userId));

  const recentQuizzesQ = db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      createdAt: quizzes.createdAt,
    })
    .from(quizzes)
    .where(eq(quizzes.createdBy, userId))
    .orderBy(sql`${quizzes.createdAt} DESC`)
    .limit(5);

  const attemptsCountQ = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(quizAttempts)
    .where(eq(quizAttempts.tenantMemberId, memberId));

  const recentAttemptsQ = db
    .select({
      id: quizAttempts.id,
      quizId: quizAttempts.quizId,
      score: quizAttempts.score,
      attemptedAt: quizAttempts.completedAt,
    })
    .from(quizAttempts)
    .where(eq(quizAttempts.tenantMemberId, memberId))
    .orderBy(sql`${quizAttempts.completedAt} DESC`)
    .limit(5);

  const flashcardsCountQ = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(flashcards)
    .where(eq(flashcards.createdBy, userId));

  const recentFlashcardsQ = db
    .select({
      id: flashcards.id,
      front: flashcards.front,
      back: flashcards.back,
      createdAt: flashcards.createdAt,
    })
    .from(flashcards)
    .where(eq(flashcards.createdBy, userId))
    .orderBy(sql`${flashcards.createdAt} DESC`)
    .limit(5);

  const decksCountQ = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(deck)
    .where(eq(deck.createdBy, userId));

  const recentDecksQ = db
    .select({
      id: deck.id,
      title: deck.title,
      createdAt: deck.createdAt,
    })
    .from(deck)
    .where(eq(deck.createdBy, userId))
    .orderBy(sql`${deck.createdAt} DESC`)
    .limit(5);

  // Streak data
  const streakQ = db.query.streaks.findFirst({
    where: eq(streaks.tenantMemberId, memberId),
  });

  const studyDaysQ = db
    .select()
    .from(studyDays)
    .where(eq(studyDays.tenantMemberId, memberId))
    .orderBy(sql`${studyDays.activityDate} DESC`)
    .limit(30); // Last 30 days of activity

  // run all queries in parallel
  let [
    quizzesCountRow,
    recentQuizzes,
    attemptsCountRow,
    recentAttempts,
    flashcardsCountRow,
    recentFlashcards,
    decksCountRow,
    recentDecks,
    streak,
    recentStudyDays,
  ] = await Promise.all([
    quizzesCountQ,
    recentQuizzesQ,
    attemptsCountQ,
    recentAttemptsQ,
    flashcardsCountQ,
    recentFlashcardsQ,
    decksCountQ,
    recentDecksQ,
    streakQ,
    studyDaysQ,
  ]);

  // extract counts (depending on driver you might get { count: '12' } as string)
  const parseCount = (row: any) => {
    if (!row || row.length === 0) return 0;
    const c = (row as any)[0].count;
    // handle number or string count
    return typeof c === "number" ? c : parseInt(c, 10) || 0;
  };

  const responsePayload = {
    member: memberDetails,
    quizzes: {
      count: parseCount(quizzesCountRow),
      recent: recentQuizzes ?? [],
    },
    attempts: {
      count: parseCount(attemptsCountRow),
      recent: recentAttempts ?? [],
    },
    flashcards: {
      count: parseCount(flashcardsCountRow),
      recent: recentFlashcards ?? [],
    },
    decks: {
      count: parseCount(decksCountRow),
      recent: recentDecks ?? [],
    },
    streak: {
      currentStreak: streak?.current ?? 0,
      longestStreak: streak?.longest ?? 0,
      lastActivityDate: streak?.lastActiveDate ?? null,
      recentStudyDays: recentStudyDays ?? [],
    },
  };

  return NextResponse.json(responsePayload);
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId } = await params;

  const subdomain = extractSubdomain(req);

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
          return NextResponse.json(
        { error: "Not a member of tenant" },
        { status: 403 }
      );
  }

  if (!tenantMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Check permission
  const allowed = await hasPermission(tenantMember.roleId, "members:manage");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [memberToDelete] = await db
    .select()
    .from(tenantMembers)
    .where(eq(tenantMembers.id, memberId));

  if (!memberToDelete || memberToDelete.tenantId !== tenantMember.tenantId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Prevent self-deletion
  if (memberToDelete.id === tenantMember.id) {
    return NextResponse.json(
      { error: "Cannot delete yourself" },
      { status: 400 }
    );
  }

  // Delete the member
  await Promise.all([
    await db.delete(tenantMembers).where(eq(tenantMembers.id, memberId)),
    await redis.del(
      `ctx:tenantMember:${memberToDelete.userId}:${memberToDelete.tenantId}`
    ),
  ]);
  return NextResponse.json({ message: "Member deleted successfully" });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId } = await params;
  const body = await req.json();
  const { roleId, isActive } = body;

  const subdomain = extractSubdomain(req);

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
          return NextResponse.json(
        { error: "Not a member of tenant" },
        { status: 403 }
      );
  }

  if (!tenantMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permission
  const allowed = await hasPermission(tenantMember.roleId, "members:manage");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify the member to update belongs to the same tenant
  const [memberToUpdate] = await db
    .select({
      id: tenantMembers.id,
      userId: tenantMembers.userId,
      tenantId: tenantMembers.tenantId,
      roleId: tenantMembers.roleId,
      isActive: tenantMembers.isActive,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(tenantMembers)
    .leftJoin(users, eq(users.id, tenantMembers.userId))
    .where(eq(tenantMembers.id, memberId));

  if (!memberToUpdate || memberToUpdate.tenantId !== tenantMember.tenantId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Update the member
  const updateData: any = {
    id: memberToUpdate.id,
    tenantId: memberToUpdate.tenantId,
    firstName: memberToUpdate.firstName,
    lastName: memberToUpdate.lastName,
    email: memberToUpdate.email,
  };
  if (roleId !== undefined) updateData.roleId = roleId;
  if (isActive !== undefined) updateData.isActive = isActive;

  const [updatedMember] = await db
    .update(tenantMembers)
    .set({
      roleId: updateData.roleId,
      isActive: updateData.isActive,
    })
    .where(eq(tenantMembers.id, memberId))
    .returning();

  await redis.set(
    `ctx:tenantMember:${memberToUpdate.userId}:${tenantMember.tenantId}`,
    updateData,
    { ex: 3600 }
  );

  return NextResponse.json({ member: updatedMember });
};
