import { db } from "@/db/conn";
import { settings, users } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const userSession = await getUserSession();

  if (!userSession.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      avatar: users.avatar,
      hasOnboarded: users.hasOnboarded,
      subdomain: settings.subdomain,
    })
    .from(users)
    .leftJoin(settings, eq(settings.userId, users.id));

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  return NextResponse.json(user);
};
