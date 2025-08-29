import { db } from "@/db/conn";
import { deck, flashcards } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await params;

  const body = await req.json();

  const [res] = await db
    .update(deck)
    .set({
      title: body.title,
      description: body.description,
    })
    .where(and(eq(deck.id, deckId), eq(deck.userId, session.user.id)))
    .returning({ deckId: deck.id });

  return NextResponse.json({ deckId: res.deckId }, { status: 200 });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await params;

  const [res] = await db
    .delete(deck)
    .where(and(eq(deck.id, deckId), eq(deck.userId, session.user.id)))
    .returning({ deckId: deck.id });

  return NextResponse.json({ deckId: res.deckId }, { status: 200 });
};

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await params;

  const [deckData] = await db
    .select({
      id: deck.id,
      title: deck.title,
      description: deck.description,
      userId: deck.userId,
      flashcardsCount: sql<number>`count(${flashcards.id})`,
    })
    .from(deck)
    .leftJoin(flashcards, eq(deck.id, flashcards.deckId))
    .where(eq(deck.id, deckId))
    .groupBy(deck.id);

  return NextResponse.json(deckData, { status: 200 });
};
