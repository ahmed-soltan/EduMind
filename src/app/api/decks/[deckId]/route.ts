import { db } from "@/db/conn";
import {
  deck,
  flashcards,
  tenantMembers,
  tenants,
  userActivities,
  users,
} from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantMember } from "@/actions/get-tenant-member";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

  // Check permission to modify decks
  const allowed = await hasPermission(tenantMember.roleId, "deck:create");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [res] = await db
    .update(deck)
    .set({
      title: body.title,
      description: body.description,
    })
    .where(and(eq(deck.id, deckId), eq(deck.tenantId, tenantMember.tenantId)))
    .returning({ deckId: deck.id });

  await db.insert(userActivities).values({
    id: crypto.randomUUID(),
    tenantId: tenantMember.tenantId,
    tenantMemberId: tenantMember.id,
    activityType: "flashcards",
    activityDate: new Date(),
    activityTitle: `Update Deck: ${body.title}`,
    activityDescription: `${tenantMember.username} updated the deck with title: ${body.title}`,
  });

  return NextResponse.json({ deckId: res.deckId }, { status: 200 });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await params;

 const subdomain = extractSubdomain(req);

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 400 });
  }

  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }


  const [res] = await db
    .delete(deck)
    .where(and(eq(deck.id, deckId), eq(deck.tenantId, tenant.id)))
    .returning({ deckId: deck.id });

  return NextResponse.json({ deckId: res.deckId }, { status: 200 });
};

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await params;

  const [deckData] = await db
    .select({
      id: deck.id,
      title: deck.title,
      description: deck.description,
      tenantId: deck.tenantId,
      flashcardsCount: sql<number>`count(${flashcards.id})`,
    })
    .from(deck)
    .leftJoin(flashcards, eq(deck.id, flashcards.deckId))
    .where(eq(deck.id, deckId))
    .groupBy(deck.id);

  return NextResponse.json(deckData, { status: 200 });
};
