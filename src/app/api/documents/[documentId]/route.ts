import { db } from "@/db/conn";
import { documents } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) => {
  const { documentId } = await params;

  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
};


export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) => {
  const { documentId } = await params;

  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await db.delete(documents).where(eq(documents.id, documentId));

  return NextResponse.json({ message: "Document deleted successfully" });
};