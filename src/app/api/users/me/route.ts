import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import { users } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const [userData] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      hasOnboarded: users.hasOnboarded,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!userData) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(userData);
};

export const PATCH = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, email } = body;

    const [updatedUser] = await db
      .update(users)
      .set({
        firstName,
        lastName,
        email,
      })
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        hasOnboarded: users.hasOnboarded,
        createdAt: users.createdAt,
      });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
