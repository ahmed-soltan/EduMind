import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import { deck, flashcards, userActivities } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq, sql } from "drizzle-orm";

export const POST = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const [res] = await db
    .insert(deck)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: body.title,
      description: body.description,
    })
    .returning({ deckId: deck.id });
    await db.insert(userActivities).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      activityType: "flashcards",
      activityDate: new Date(),
      activityTitle: `Create New Deck: ${body.title}`,
      activityDescription: `You created a new deck with title: ${body.title}`,
    });

  return NextResponse.json({ deckId: res.deckId }, { status: 201 });
};

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

const decks = await db
  .select({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    userId: deck.userId,
    createdAt: deck.createdAt,
    flashcardsCount: sql<number>`count(${flashcards.id})`,
  })
  .from(deck)
  .leftJoin(flashcards, eq(flashcards.deckId, deck.id))
  .where(eq(deck.userId, session.user.id))
  .groupBy(deck.id);


  return NextResponse.json(decks, { status: 200 });
};
