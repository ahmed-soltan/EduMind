import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import { getUserSession } from "@/utils/get-user-session";
import {
  flashcards,
  tenantMembers,
  tenants,
  userActivities,
  users,
} from "@/db/schema";
import { canCreateFeature } from "@/utils/can-create-feature";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantMember } from "@/actions/get-tenant-member";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await params;

  const flashcardsData = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.deckId, deckId));

  return NextResponse.json(flashcardsData);
};

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await params;

  const body = await req.json();

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

  if (!tenantMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { canCreate } = await canCreateFeature(
    tenantMember.tenantId,
    "flashcards"
  );
  if (!canCreate) {
    return NextResponse.json(
      { error: "Flashcard limit reached. Please upgrade your plan." },
      { status: 403 }
    );
  }

  const [newFlashcard] = await Promise.all([
    await db
      .insert(flashcards)
      .values({
        id: crypto.randomUUID(),
        deckId,
        front: body.front,
        back: body.back,
        tenantId: tenantMember.tenantId,
        source: "manual",
      })
      .returning({
        id: flashcards.id,
      }),

    await db.insert(userActivities).values({
      id: crypto.randomUUID(),
      tenantId: tenantMember.tenantId,
      tenantMemberId: tenantMember.id,
      activityType: "flashcards",
      activityDate: new Date(),
      activityTitle: `Create Flashcard: ${body.front}`,
      activityDescription: `${tenantMember.username} created a new flashcard`,
    }),
  ]);

  return NextResponse.json(newFlashcard);
};
