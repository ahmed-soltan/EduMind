import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import {
  attemptsAnswers,
  quizAttempts,
  quizQuestions,
  userActivities,
} from "@/db/schema";

import { recordStudyEvent } from "@/utils/streak-helper";
import { getUserSession } from "@/utils/get-user-session";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantMember } from "@/actions/get-tenant-member";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

type IncomingAnswer = { questionId: string; answer: string };

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json("unauthenticated", { status: 401 });
  }

  const { quizId } = await params;
  const body: { answers: IncomingAnswer[] } = await req.json();

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

  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId));

  const answersMap = new Map<string, string>(
    body.answers.map((a) => [a.questionId, a.answer])
  );

  let correctCount = 0;
  const gradedAnswers = questions.map((q) => {
    const userAnswer = answersMap.get(q.id);
    const isCorrect = userAnswer === q.answer;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      answer: userAnswer ?? "", // fallback in case user skipped
      isCorrect,
    };
  });

  const scorePercentage = (correctCount / questions.length) * 100;

  const attemptId = crypto.randomUUID();

  await db.insert(quizAttempts).values({
    id: attemptId,
    tenantId: tenantMember.tenantId,
    tenantMemberId: tenantMember.id,
    score: scorePercentage,
    quizId,
  });
  await db.insert(attemptsAnswers).values(
    gradedAnswers.map((a) => ({
      id: crypto.randomUUID(),
      attemptId,
      questionId: a.questionId,
      answer: a.answer,
      isCorrect: a.isCorrect,
    }))
  ),
    await Promise.all([
      await db.insert(userActivities).values({
        id: crypto.randomUUID(),
        tenantId: tenantMember.tenantId,
        tenantMemberId: tenantMember.id,
        activityType: "quizzes",
        activityDate: new Date(),
        activityTitle: `Quiz Attempt: ${quizId}`,
        activityDescription: `${tenantMember.username} attempted the quiz: ${quizId}`,
      }),
      await recordStudyEvent({
        tenantMemberId: tenantMember.id,
        tenantId: tenantMember.tenantId,
        source: "quiz",
        occurredAtUtc: new Date(),
      }),
    ]);

  return NextResponse.json(
    { message: "Quiz attempt submitted", score: scorePercentage },
    { status: 200 }
  );
};

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json("unauthenticated", { status: 401 });
  }

  const subdomain =
    req.cookies.get("subdomain")?.value || extractSubdomain(req);

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

  const { quizId } = await params;

  const [attempt] = await db
    .select()
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, quizId),
        eq(quizAttempts.tenantMemberId, tenantMember.id)
      )
    );

  if (!attempt) {
    return NextResponse.json(
      {
        attempt: null,
        attemptAnswers: [],
      },
      { status: 404 }
    );
  }

  const attemptAnswers = await db
    .select()
    .from(attemptsAnswers)
    .where(eq(attemptsAnswers.attemptId, attempt.id));

  return NextResponse.json({ attempt, attemptAnswers }, { status: 200 });
};
