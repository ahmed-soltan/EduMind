import { db } from "@/db/conn";
import {
  quizAttempts,
  quizQuestions,
  quizzes,
  userActivities,
} from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }
  const quizzesWithUserAttempts = await db
    .select({
      quiz: quizzes,
      quizAttempt: quizAttempts,
    })
    .from(quizzes)
    .leftJoin(quizAttempts, eq(quizAttempts.quizId, quizzes.id))
    .where(eq(quizzes.userId, session.user.id))
    .orderBy(quizzes.createdAt);

  const totalUserAttempts = quizzesWithUserAttempts.filter(
    (row) => row.quizAttempt
  ).length;

  const averageScore =
    quizzesWithUserAttempts.reduce((acc, row) => {
      if (row.quizAttempt) {
        acc += row.quizAttempt.score || 0;
      }
      return acc;
    }, 0) / totalUserAttempts;

  return NextResponse.json({
    quizzes: quizzesWithUserAttempts, // now this is an array
    totalAttempts: totalUserAttempts,
    averageScore: isNaN(averageScore) ? 0 : averageScore,
  });
};

export const POST = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const { topic, prompt, numQuestions, difficulty } = await req.json();

  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "gemini-2.0-flash",
    temperature: 0.7,
  });

  // 3. Structured prompt for JSON output
  const quizPrompt = new PromptTemplate({
    template: `
  You are a quiz generator.
  Use the following custom instruction from the user: "{prompt}".

  Generate {numQuestions} multiple-choice questions about "{topic}".
  Difficulty: {difficulty}.

  Return the result strictly in **valid JSON** in the following structure:

  {{
    "title": "string",
    "description": "string",
    "estimationTime": number,
    "questions": [
      {{
        "questionText": "string",
        "questionType": "mcq",
        "options": ["option1", "option2", "option3", "option4"],
        "answer": "the full text of the correct option, exactly as it appears in the options array",
        "explanation": "Short explanation why this answer is correct"
      }}
    ]
  }}

  Important rules:
  - Do NOT return just letters like "A", "B", "C", "D".
  - "answer" must match one of the strings from the "options" array.
  - Ensure valid JSON, without trailing commas.
  `,
    inputVariables: ["topic", "numQuestions", "difficulty", "prompt"],
  });

  const formattedPrompt = await quizPrompt.format({
    topic,
    numQuestions,
    difficulty,
    prompt,
  });

  // 4. Call Gemini
  const response = await model.invoke(formattedPrompt);

  // 5. Parse JSON safely
  let result: any;
  try {
    const cleaned = (response.content as string)
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    result = JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse quiz JSON:", response.content);
    return NextResponse.json(
      { error: "Failed to parse quiz JSON" },
      { status: 500 }
    );
  }

  const [newQuiz] = await db
    .insert(quizzes)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      topic,
      prompt,
      numQuestions,
      difficulty,
    })
    .returning({ id: quizzes.id });

  const quizId = newQuiz.id;

  // 6. Insert quiz questions into DB
  const values = result.questions.map((q: any) => ({
    id: crypto.randomUUID(),
    quizId,
    questionText: q.questionText,
    questionType: q.questionType || "mcq",
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }));

  await Promise.all([
    await db
      .update(quizzes)
      .set({
        title: result.title,
        description: result.description,
        estimatedTime: result.estimationTime,
      })
      .where(eq(quizzes.id, quizId)),
    await db.insert(quizQuestions).values(values),
    await db.insert(userActivities).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      activityType: "quizzes",
      activityDate: new Date(),
      activityTitle: `Create New Quiz on ${topic}`,
      activityDescription: `AI generated quiz with ${numQuestions} questions on ${topic}`,
    }),
  ]);

  // 7. Return quiz with its questions
  return NextResponse.json({
    quiz: newQuiz,
    questions: values,
  });
};
