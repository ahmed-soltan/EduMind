// app/api/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/conn";
import { chunks, documents, userActivities } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const runtime = "nodejs"; // ensure Node runtime (not Edge)

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  console.log(session)

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documentsData = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, session.user?.id));

  return NextResponse.json(documentsData);
};


const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // new free embedding model
  apiKey: process.env.GEMINI_API_KEY!,
});

export const POST = async (req: NextRequest) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    // Expect JSON body with extracted text
    const body = await req.json();
    const {
      title = "",
      url = "",
      key = "",
      size = 0,
      type = "application/octet-stream",
      text = "",
    } = body;

    // Insert document metadata
    const [newDocument] = await db
      .insert(documents)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        title,
        url,
        size: Math.floor(Number(size) || 0),
        type,
        key,
      })
      .returning({ id: documents.id });

  if (text.trim().length > 0) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.splitText(text);

    // 👉 Free embeddings from Google
    const vectors = await embeddings.embedDocuments(docs);

    for (let i = 0; i < docs.length; i++) {
      await db.insert(chunks).values({
        id: crypto.randomUUID(),
        documentId: newDocument.id,
        content: docs[i],
        embedding: vectors[i],
      });
    }
  }

  await db.insert(userActivities).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    activityType: "documents",
    activityDate: new Date(),
    activityTitle: `Upload Document: ${title}`,
    activityDescription: `You uploaded a new document: ${title} of type ${type}`,
  });

  return NextResponse.json({ documentId: newDocument.id });
};
