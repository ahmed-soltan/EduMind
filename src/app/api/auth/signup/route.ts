import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db/conn";
import { settings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const POST = async (req: NextRequest) => {
  const { email, password, firstName, lastName } = (await req.json()) as {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  // Check if user exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser) {
    return NextResponse.json({ error: "User exists" }, { status: 409 });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let user;
  try {
    const [newUser] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
        hasOnboarded: users.hasOnboarded,
      });
    user = newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }

  const [userSettings] = await db
    .select({ subdomain: settings.subdomain })
    .from(settings)
    .where(eq(settings.userId, user.id));

  const accessSecret = new TextEncoder().encode(process.env.ACCESS_SECRET!);
  const refreshSecret = new TextEncoder().encode(process.env.REFRESH_SECRET!);

  const accessToken = await new SignJWT({
    user: {
      id: user.id,
      email: user.email,
      subdomain: userSettings.subdomain,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    },
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecret);

  const refreshToken = await new SignJWT({
    user: {
      id: user.id,
      email: user.email,
      subdomain: userSettings.subdomain,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    },
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshSecret);

  const res = NextResponse.json({ accessToken });
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });
  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });
  return res;
};
