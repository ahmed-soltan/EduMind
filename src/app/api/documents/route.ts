import { db } from "@/db/conn";
import { documents } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documentsData = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, session.user.id));

  return NextResponse.json(documentsData);
};

export const POST = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const [newDocument] = await db
    .insert(documents)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: body.title,
      url: body.url,
      size: body.size,
      type: body.type,
      key: body.key
    })
    .returning({ id: documents.id });

  return NextResponse.json({ documentId: newDocument.id });
};
