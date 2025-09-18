import { db } from "@/db/conn";
import { plans } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const plansInfo = await db.select().from(plans);

  const planWithAnnualPrice = plansInfo.map(plan => ({
    ...plan,
    annualPrice: plan.cents * 12 * (1 - (plan.annual_discount_percent) / 100)
  }));

  return NextResponse.json({ plans: planWithAnnualPrice });
};
