import { db } from "@/db/conn";
import { settings, users } from "@/db/schema";
import { checkAuth } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const token = req.cookies.get("accessToken")?.value;
  const { isAuthenticated, userId } = await checkAuth(req, token);

  if (!isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const [existingSubdomain] = await db
    .select()
    .from(settings)
    .where(eq(settings.subdomain, body.subdomain));

  if (existingSubdomain) {
    return NextResponse.json(
      { message: "Subdomain already exists, Choose another one" },
      { status: 400 }
    );
  }

  let subdomain;
  try {
    [subdomain] = await db
      .insert(settings)
      .values({ ...body, userId, id: crypto.randomUUID() })
      .returning({ subdomain: settings.subdomain });
  } catch (error) {
    console.error("Error inserting settings:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
  await db
    .update(users)
    .set({ hasOnboarded: true })
    .where(eq(users.id, userId));

  return NextResponse.json({
    message: "User onboarded successfully",
    subdomain,
  });
};
