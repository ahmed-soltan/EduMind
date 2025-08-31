import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import { attemptsAnswers, quizAttempts, quizQuestions } from "@/db/schema";

import { getUserSession } from "@/utils/get-user-session";

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

  // 4️⃣ Create attempt first
  const attemptId = crypto.randomUUID();
  await db.insert(quizAttempts).values({
    id: attemptId,
    userId: session.user.id,
    quizId,
    score: scorePercentage,
  });

  // 5️⃣ Insert answers with attemptId
  await db.insert(attemptsAnswers).values(
    gradedAnswers.map((a) => ({
      id: crypto.randomUUID(),
      attemptId,
      questionId: a.questionId,
      answer: a.answer,
      isCorrect: a.isCorrect,
    }))
  );

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

    console.log({attempt, attemptAnswers})


  return NextResponse.json({ attempt, attemptAnswers }, { status: 200 });
};
