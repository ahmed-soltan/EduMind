import { db } from "@/db/conn";
import { flashcards } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const flashcardsData = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.userId, session.user.id));

    const flashCardsThisMonth = flashcardsData.filter((card) => {
      const cardDate = new Date(card.createdAt);
      const currentDate = new Date();
      return (
        cardDate.getMonth() === currentDate.getMonth() &&
        cardDate.getFullYear() === currentDate.getFullYear()
      );
    }).length;

    const flashCardsLastMonth = flashcardsData.filter((card) => {
      const cardDate = new Date(card.createdAt);
      const currentDate = new Date();
      return (
        cardDate.getMonth() === currentDate.getMonth() - 1 &&
        cardDate.getFullYear() === currentDate.getFullYear()
      );
    }).length;

    const flashCardsTotal = flashcardsData.length;
    // I want to calculate the increasing percentage from last month to this month
    const flashCardsIncreasePercentage =
      flashCardsThisMonth > 0 && flashCardsLastMonth > 0
        ? ((flashCardsThisMonth - flashCardsLastMonth) / flashCardsLastMonth) * 100
        : 0;

  return NextResponse.json({ flashcards: flashcardsData, flashCardsThisMonth, flashCardsLastMonth, flashCardsTotal, flashCardsIncreasePercentage });
};
