import { db } from "@/db/conn";
import { quizAttempts, quizQuestions, quizzes } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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

  const { quizId } = await params;

  await Promise.all([
    db.delete(quizAttempts).where(eq(quizAttempts.quizId, quizId)),
    db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId)),
    db.delete(quizzes).where(eq(quizzes.id, quizId)),
  ]);


  return NextResponse.json("Quiz deleted", { status: 200 });
};
