import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import {
  flashcards,
  userActivities,
} from "@/db/schema";
import { hasPermission } from "@/utils/has-permission";
import { getUserSession } from "@/utils/get-user-session";
import { extractSubdomain } from "@/utils/extract-subdomain";

import { getTenantMember } from "@/actions/get-tenant-member";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; flashcardId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { deckId, flashcardId } = await params;

  const [flashCard] = await db
    .select()
    .from(flashcards)
    .where(and(eq(flashcards.id, flashcardId), eq(flashcards.deckId, deckId)));

  return NextResponse.json(flashCard, { status: 200 });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; flashcardId: string }> }
) => {
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

  if (!tenantMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permission to modify flashcards
  const allowed = await hasPermission(tenantMember.roleId, "flashcard:create");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { deckId, flashcardId } = await params;

  await db
    .delete(flashcards)
    .where(and(eq(flashcards.id, flashcardId), eq(flashcards.deckId, deckId)));

  return NextResponse.json({ message: "Flashcard deleted successfully" });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; flashcardId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId, flashcardId } = await params;

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

  // Check permission to modify flashcards
  const allowed = await hasPermission(tenantMember.roleId, "flashcard:create");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Promise.all([
    await db
      .update(flashcards)
      .set({
        front: body.front,
        back: body.back,
      })
      .where(
        and(eq(flashcards.id, flashcardId), eq(flashcards.deckId, deckId))
      ),

    await db.insert(userActivities).values({
      id: crypto.randomUUID(),
      tenantId: tenantMember.tenantId,
      tenantMemberId: tenantMember.id,
      activityType: "flashcards",
      activityDate: new Date(),
      activityTitle: `Update Flashcard: ${body.front}`,
      activityDescription: `${tenantMember.username} updated the flashcard with front: ${body.front}`,
    }),
  ]);

  return NextResponse.json({ message: "Flashcard updated successfully" });
};
