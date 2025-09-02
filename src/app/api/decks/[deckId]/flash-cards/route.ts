import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/conn";
import { flashcards, userActivities } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await params;

  const flashcardsData = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.deckId, deckId));

  return NextResponse.json(flashcardsData);
};

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await params;

  const body = await req.json();


  const [newFlashcard] = await Promise.all([
    await db
      .insert(flashcards)
      .values({
        id: crypto.randomUUID(),
        deckId,
        front: body.front,
        back: body.back,
        userId: session.user.id,
        source: "manual",
      })
      .returning({
        id: flashcards.id,
      }),
  
      await db.insert(userActivities).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        activityType: "flashcards",
        activityDate: new Date(),
        activityTitle: `Create Flashcard: ${body.front}`,
        activityDescription: `You created a new flashcard`,
      })
  ])


  return NextResponse.json(newFlashcard);
};
