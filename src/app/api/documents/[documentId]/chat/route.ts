import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import { assistantMessages } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) => {
  const { documentId } = await params;

  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!documentId) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const messages = await db
    .select({
      id: assistantMessages.id,
      message: assistantMessages.message,
      createdAt: assistantMessages.createdAt,
      role: assistantMessages.role,
      document: assistantMessages.documentId,
      memberName: assistantMessages.memberName,
    })
    .from(assistantMessages)
    .where(eq(assistantMessages.documentId, documentId))
    .orderBy(assistantMessages.createdAt);

  return NextResponse.json(messages);
};
