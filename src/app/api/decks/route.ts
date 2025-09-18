import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";
import {
  deck,
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

export const POST = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Check permission to create decks
  const allowed = await hasPermission(tenantMember.roleId, "deck:create");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { canCreate } = await canCreateFeature(tenantMember.tenantId, "decks");
  if (!canCreate) {
    return NextResponse.json(
      { error: "Deck limit reached. Please upgrade your plan." },
      { status: 403 }
    );
  }

  const [res] = await db
    .insert(deck)
    .values({
      id: crypto.randomUUID(),
      tenantId: tenantMember.tenantId,
      title: body.title,
      description: body.description,
      createdBy: tenantMember.id,
    })
    .returning({ deckId: deck.id });
  await db.insert(userActivities).values({
    id: crypto.randomUUID(),
    tenantId: tenantMember.tenantId,
    tenantMemberId: tenantMember.id,
    activityType: "flashcards",
    activityDate: new Date(),
    activityTitle: `${tenantMember.username} Create New Deck: ${body.title}`,
    activityDescription: `${tenantMember.username} created a new deck with title: ${body.title}`,
  });

  return NextResponse.json({ deckId: res.deckId }, { status: 201 });
};

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const subdomain = extractSubdomain(req);

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 400 });
  }

  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const decks = await db
    .select({
      id: deck.id,
      title: deck.title,
      description: deck.description,
      tenantId: deck.tenantId,
      createdAt: deck.createdAt,
      flashcardsCount: sql<number>`count(${flashcards.id})`,
    })
    .from(deck)
    .leftJoin(flashcards, eq(flashcards.deckId, deck.id))
    .where(eq(deck.tenantId, tenant.id))
    .groupBy(deck.id);

  return NextResponse.json(decks, { status: 200 });
};
