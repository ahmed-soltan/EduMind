import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import { flashcards } from "@/db/schema";

import { getUserSession } from "@/utils/get-user-session";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; flashcardId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { deckId, flashcardId } = await params;

  const [flashCard] = await db
    .select()
    .from(flashcards)
    .where(and(eq(flashcards.id, flashcardId), eq(flashcards.deckId, deckId)));

  return NextResponse.json(flashCard, { status: 200 });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; flashcardId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId, flashcardId } = await params;

  await db
    .delete(flashcards)
    .where(and(eq(flashcards.id, flashcardId), eq(flashcards.deckId, deckId)));

  return NextResponse.json({ message: "Flashcard deleted successfully" });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; flashcardId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId, flashcardId } = await params;

  const body = await req.json();

  await db
    .update(flashcards)
    .set({
      front: body.front,
      back: body.back,
    })
    .where(and(eq(flashcards.id, flashcardId), eq(flashcards.deckId, deckId)));

  return NextResponse.json({ message: "Flashcard updated successfully" });
};
