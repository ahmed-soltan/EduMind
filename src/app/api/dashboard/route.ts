import { extractSubdomain } from "@/utils/extract-subdomain";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const subdomain = extractSubdomain(req);

  if (!subdomain) {
    return NextResponse.json(
      { error: "Subdomain is required" },
      { status: 400 }
    );
  }

  // later you can fetch user/settings here with drizzle
  return NextResponse.json({ message: "ok", subdomain });
};
