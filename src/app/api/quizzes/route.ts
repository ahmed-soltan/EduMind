// app/api/quizzes/route.ts
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { db } from "@/db/conn";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";
import { canCreateFeature } from "@/utils/can-create-feature";
import {
  quizAttempts,
  quizQuestions,
  quizzes,
  tenants,
  userActivities,
} from "@/db/schema";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantMember } from "@/actions/get-tenant-member";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

/**
 * Helper: build cache key for per-user-per-tenant context
 */

/* --------------------------------------------------------
   GET handler - list quizzes + user attempts + stats
   -------------------------------------------------------- */
export const GET = async (req: NextRequest) => {
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

  // fetch quizzes joined with the current member's attempts (single query)
  const quizzesWithUserAttempts = await db
    .select({
      quiz: quizzes,
      quizAttempt: quizAttempts,
    })
    .from(quizzes)
    .leftJoin(
      quizAttempts,
      and(
        eq(quizAttempts.quizId, quizzes.id),
        eq(quizAttempts.tenantMemberId, tenantMember.id)
      )
    )
    .where(eq(quizzes.tenantId, tenantMember.tenantId))
    .orderBy(quizzes.createdAt);

  // Compute totals and average
  const totalTenantMemberAttempts = quizzesWithUserAttempts.filter(
    (row) => !!row.quizAttempt
  ).length;

  const averageScore =
    quizzesWithUserAttempts.reduce((acc, row) => {
      if (row.quizAttempt) acc += row.quizAttempt.score ?? 0;
      return acc;
    }, 0) / Math.max(totalTenantMemberAttempts, 1);

  return NextResponse.json({
    quizzes: quizzesWithUserAttempts,
    totalAttempts: totalTenantMemberAttempts,
    averageScore: isNaN(averageScore) ? 0 : averageScore,
  });
};

/* --------------------------------------------------------
   POST handler - create a quiz (AI-generated)
   - uses getTenantMember to obtain tenantMember (cache-first)
   - checks permission using hasPermission
   - checks quota using canCreateFeature
   -------------------------------------------------------- */
export const POST = async (req: NextRequest) => {
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

  // check permission (use DB-backed check)
  const allowed = await hasPermission(tenantMember.roleId, "quiz:create");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // check plan limits
  const { canCreate } = await canCreateFeature(
    tenantMember.tenantId,
    "quizzes"
  );
  if (!canCreate) {
    return NextResponse.json(
      { error: "Quiz creation limit reached" },
      { status: 403 }
    );
  }

  // parse request body
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { topic, prompt, numQuestions = 5, difficulty = "medium" } = body;

  if (!topic || !prompt) {
    return NextResponse.json(
      { error: "Missing topic or prompt" },
      { status: 400 }
    );
  }

  // Build model & prompt (your existing code)
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "gemini-2.0-flash",
    temperature: 0.7,
  });

const quizPrompt = new PromptTemplate({
  template: `
You are a quiz generator.
Use the following custom instruction from the user: "{prompt}".

Generate {numQuestions} multiple-choice questions about "{topic}".
Difficulty: {difficulty}.

Return the result strictly in valid JSON in the following structure:

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

  // Call model
  const response = await model.invoke(formattedPrompt);

  // Parse JSON safely
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

  // Insert quiz + questions + activity inside parallel operations
  const [newQuiz] = await db
    .insert(quizzes)
    .values({
      id: crypto.randomUUID(),
      tenantId: tenantMember.tenantId,
      createdBy: tenantMember.id,
      topic,
      prompt,
      numQuestions,
      difficulty,
    })
    .returning({ id: quizzes.id });

  const quizId = newQuiz.id;

  const values = (result.questions || []).map((q: any) => ({
    id: crypto.randomUUID(),
    quizId,
    questionText: q.questionText,
    questionType: q.questionType || "mcq",
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }));

  await Promise.all([
    db
      .update(quizzes)
      .set({
        title: result.title,
        description: result.description,
        estimatedTime: result.estimationTime,
      })
      .where(eq(quizzes.id, quizId)),
    db.insert(quizQuestions).values(values),
    db.insert(userActivities).values({
      id: crypto.randomUUID(),
      tenantId: tenantMember.tenantId,
      tenantMemberId: tenantMember.id,
      activityType: "quizzes",
      activityDate: new Date(),
      activityTitle: `${tenantMember.username} Create New Quiz on ${topic}`,
      activityDescription: `AI generated quiz with ${numQuestions} questions on ${topic}`,
    }),
  ]);

  // Optionally: update cached context usage counters / counters in Redis here

  return NextResponse.json({
    quiz: newQuiz,
    questions: values,
  });
};
