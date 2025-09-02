import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import {
  attemptsAnswers,
  quizAttempts,
  quizQuestions,
  userActivities,
} from "@/db/schema";

import { getUserSession } from "@/utils/get-user-session";
import { recordStudyEvent } from "@/utils/streak-helper";

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
    userId: session.user.id,
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
      userId: session.user.id,
      activityType: "quizzes",
      activityDate: new Date(),
      activityTitle: `Quiz Attempt: ${quizId}`,
      activityDescription: `You attempted the quiz: ${quizId}`,
    }),
    await recordStudyEvent({
      userId: session.user.id,
      source: "quiz",
      occurredAtUtc: new Date(),
    })
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

  const { quizId } = await params;

  const [attempt] = await db
    .select()
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, quizId),
        eq(quizAttempts.userId, session.user.id)
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
