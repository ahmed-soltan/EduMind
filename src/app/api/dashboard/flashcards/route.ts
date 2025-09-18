import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";
import { getTenantMember } from "@/actions/get-tenant-member";
import { db } from "@/db/conn";
import { flashcards, tenantMembers, tenants } from "@/db/schema";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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

  let tenantMember;
  try {
    tenantMember = await getTenantMember(session.user.id, tenant.id);
  } catch (err: any) {
          return NextResponse.json(
        { error: "Not a member of tenant" },
        { status: 403 }
      );
  }

  const flashcardsData = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.tenantId, tenantMember.tenantId));

  const flashCardsThisMonth = flashcardsData.filter((card) => {
    const cardDate = new Date(card.createdAt);
    const currentDate = new Date();
    return (
      cardDate.getMonth() === currentDate.getMonth() &&
      cardDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  const flashCardsLastMonth = flashcardsData.filter((card) => {
    const cardDate = new Date(card.createdAt);
    const currentDate = new Date();
    return (
      cardDate.getMonth() === currentDate.getMonth() - 1 &&
      cardDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  const flashCardsTotal = flashcardsData.length;
  // I want to calculate the increasing percentage from last month to this month
  const flashCardsIncreasePercentage =
    flashCardsThisMonth > 0 && flashCardsLastMonth > 0
      ? ((flashCardsThisMonth - flashCardsLastMonth) / flashCardsLastMonth) *
        100
      : 0;

  return NextResponse.json({
    flashcards: flashcardsData,
    flashCardsThisMonth,
    flashCardsLastMonth,
    flashCardsTotal,
    flashCardsIncreasePercentage,
  });
};
