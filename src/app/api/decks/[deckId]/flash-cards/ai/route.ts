import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { db } from "@/db/conn";
import { getUserSession } from "@/utils/get-user-session";
import { deck, flashcards, userActivities } from "@/db/schema";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const { deckId } = await params;
  const { numFlashCards } = await req.json();

  const [deckData] = await db
    .select({
      title: deck.title,
      description: deck.description,
    })
    .from(deck)
    .where(eq(deck.id, deckId));

  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "gemini-2.0-flash",
    temperature: 0.7,
  });

  const flashcardPrompt = new PromptTemplate({
    template: `
You are an AI that generates flashcards for studying.

The user provides:
- Deck title: {title}
- Deck description: {description}
- Number of flashcards: {numFlashCards}

Your task:
- Generate exactly {numFlashCards} flashcards.
- Each flashcard must include:
  - front: the question or prompt
  - back: the correct answer
  - hint: (optional) a short clue that helps recall, keep it concise
  - source: always set to "assistant"

Return the result as a valid JSON array only, without extra text.
  `,
    inputVariables: ["title", "description", "numFlashCards"],
  });

  const formattedPrompt = await flashcardPrompt.format({
    title: deckData.title,
    description: deckData.description,
    numFlashCards,
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

  const values = result.map((flashcard: any) => ({
    id: crypto.randomUUID(),
    deckId,
    front: flashcard.front,
    back: flashcard.back,
    hint: flashcard.hint,
    source: flashcard.source,
    userId: session.user.id,
    createdAt: new Date(),
  }));

  await Promise.all([
    await db.insert(flashcards).values(values),
    await db.insert(userActivities).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      activityType: "flashcards",
      activityDate: new Date(),
      activityTitle: `Create Flashcards for Deck: ${deckData.title}`,
      activityDescription: `AI generated new flashcards in deck ${deckData.title}`,
    }),
  ]);

  return NextResponse.json({ success: true });
};
