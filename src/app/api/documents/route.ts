import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { db } from "@/db/conn";
import {
  chunks,
  documents,
  tenants,
  userActivities,
} from "@/db/schema";
import { hasPermission } from "@/utils/has-permission";
import { getUserSession } from "@/utils/get-user-session";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { canCreateFeature } from "@/utils/can-create-feature";

import { getTenantMember } from "@/actions/get-tenant-member";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

export const runtime = "nodejs"; // ensure Node runtime (not Edge)

export const GET = async (req: NextRequest) => {
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

  const documentsData = await db
    .select()
    .from(documents)
    .where(eq(documents.tenantId, tenantMember.tenantId));

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

  const subdomain = extractSubdomain(req);

  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.subdomain, subdomain!));

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

  if (!tenantMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permission to upload documents
  const allowed = await hasPermission(tenantMember.roleId, "document:upload");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check if the user has permission to create documents
  const { canCreate } = await canCreateFeature(
    tenantMember.tenantId,
    "documents"
  );
  if (!canCreate) {
    return NextResponse.json(
      { error: "Document limit reached. Please upgrade your plan." },
      { status: 403 }
    );
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
      tenantId: tenantMember.tenantId,
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
    tenantId: tenantMember.tenantId,
    tenantMemberId: tenantMember.id,
    activityType: "documents",
    activityDate: new Date(),
    activityTitle: `Upload Document: ${title}`,
    activityDescription: `${tenantMember.username} uploaded a new document: ${title} of type ${type}`,
  });

  return NextResponse.json({ documentId: newDocument.id });
};
