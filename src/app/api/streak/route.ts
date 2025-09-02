import { db } from "@/db/conn";
import { streaks, studyDays } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const streak = await db.query.streaks.findFirst({
    where: eq(streaks.userId, session.user.id),
  });

  const days = await db
    .select()
    .from(studyDays)
    .where(eq(studyDays.userId, session.user.id))
    .orderBy(studyDays.activityDate);

  return NextResponse.json({ streak, studyDays: days });
};
