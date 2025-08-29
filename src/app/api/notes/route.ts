import { db } from "@/db/conn";
import { notes } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// export const POST = async (req: NextRequest) => {
//   const session = await getUserSession();

//   if (!session.isAuthenticated) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
// };

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch notes for the user
  const notesData = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, session.user.id));
  return NextResponse.json(notesData);
};
