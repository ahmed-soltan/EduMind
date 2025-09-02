import { db } from "@/db/conn";
import { userActivities } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  const limit = req.nextUrl.searchParams.get("limit");

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let activities;

  if (limit) {
    activities = await db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, session.user.id))
      .limit(parseInt(limit));
  } else {
    activities = await db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, session.user.id));
  }

  return NextResponse.json(activities.reverse());
};
