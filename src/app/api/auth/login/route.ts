import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/conn";
import { settings, users } from "@/db/schema";
import { rootDomain } from "@/lib/utils";

export const POST = async (req: NextRequest) => {
  const { email, password } = await req.json();

  const [user] = await db.select().from(users).where(eq(users.email, email));
  const isMatchPassword = await bcrypt.compare(password, user.password);
  if (!user || !isMatchPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
    domain: `.${rootDomain}`,
  });
  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
    domain: `.${rootDomain}`,
  });
  return res;
};
