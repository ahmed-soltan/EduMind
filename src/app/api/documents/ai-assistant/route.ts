import crypto from "crypto";
import { desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

import { db } from "@/db/conn";
import { getUserSession } from "@/utils/get-user-session";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { assistantMessages, userActivities } from "@/db/schema";
import { searchChunks } from "@/features/ai-assistant/utils/search-chunks";

import { getTenantMember } from "@/actions/get-tenant-member";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY!,
});

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "gemini-2.0-flash",
  temperature: 0.7,
});

export const POST = async (req: NextRequest) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subdomain = extractSubdomain(req);

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 400 });
  }

  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  let tenantMember;
  try {
    tenantMember = await getTenantMember(session.user.id, tenant.id);
  } catch (err: any) {
          return NextResponse.json(
        { error: "Not a member of tenant" },
        { status: 403 }
      );
  }

  const { documentId, message } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  // save user message
  await db.insert(assistantMessages).values({
    id: crypto.randomUUID(),
    documentId,
    tenantId: tenantMember.tenantId,
    tenantMemberId: tenantMember.id,
    role: "user",
    message,
  });

  // fetch the last 5 previous messages for memory
  const history = await db
    .select({
      role: assistantMessages.role,
      message: assistantMessages.message,
    })
    .from(assistantMessages)
    .where(eq(assistantMessages.documentId, documentId))
    .orderBy(desc(assistantMessages.createdAt))
    .limit(5);

  // reverse so oldest comes first
  const conversationHistory = history.reverse().map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.message,
  }));

  // embed the query
  const [queryEmbedding] = await embeddings.embedDocuments([message]);

  // retrieve similar chunks
  const relevantChunks = await searchChunks(queryEmbedding, documentId, 5);
  const context = relevantChunks.map((c: any) => c.content).join("\n\n");

  // prepare prompt
  const promptMessages = [
    {
      role: "system",
      content:
        "You are a helpful assistant. Answer based on the document context when possible.",
    },
    {
      role: "user",
      content: `Document context:\n${context}`,
    },
    ...conversationHistory, // memory (last few exchanges)
    { role: "user", content: message }, // latest user input
  ];

  // send to Gemini
  const response = await model.invoke(promptMessages);
  const aiMessage = response.content.toString();

  // save assistant message
  await db.insert(assistantMessages).values({
    id: crypto.randomUUID(),
    documentId,
    tenantId: tenantMember.tenantId,
    tenantMemberId: tenantMember.id,
    role: "assistant",
    message: aiMessage,
  });

  await db.insert(userActivities).values({
    id: crypto.randomUUID(),
    tenantId: tenantMember.tenantId,
    tenantMemberId: tenantMember.id,
    activityType: "documents",
    activityDate: new Date(),
    activityTitle: `A Chat Message Sent`,
    activityDescription: `${tenantMember.username} sent a chat message: ${message}`,
  });

  return NextResponse.json({ documentId, reply: aiMessage });
};
