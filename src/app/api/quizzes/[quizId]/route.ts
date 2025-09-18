import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import {
  quizAttempts,
  quizQuestions,
  quizzes,
} from "@/db/schema";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";

import { getTenantMember } from "@/actions/get-tenant-member";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const { quizId } = await params;

  const [quiz] = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      estimatedTime: quizzes.estimatedTime,
    })
    .from(quizzes)
    .where(eq(quizzes.id, quizId));

  if (!quiz) {
    return NextResponse.json("Quiz not found", { status: 404 });
  }

  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId));

  const [attempt] = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.quizId, quizId));

  return NextResponse.json({
    quiz,
    questions,
    attempt,
  });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json("Unauthorized", { status: 401 });
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

  if (!tenantMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await hasPermission(tenantMember.roleId, "quiz:delete");

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { quizId } = await params;

  await Promise.all([
    db.delete(quizAttempts).where(eq(quizAttempts.quizId, quizId)),
    db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId)),
    db.delete(quizzes).where(eq(quizzes.id, quizId)),
  ]);

  return NextResponse.json("Quiz deleted", { status: 200 });
};
