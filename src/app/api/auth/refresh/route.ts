import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

import { rootDomain } from "@/lib/utils";

export const POST = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken)
    return NextResponse.json({ error: "No token" }, { status: 401 });
  try {
    const refreshSecret = new TextEncoder().encode(process.env.REFRESH_SECRET!);
    const { payload } = await jwtVerify(refreshToken, refreshSecret);
    const secret = new TextEncoder().encode(process.env.ACCESS_SECRET!);

    const newAccessToken = await new SignJWT({ user: payload.user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret);

    const newRefreshToken = await new SignJWT({ user: payload.user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(refreshSecret);

    const res = NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: `.${rootDomain}`,
      path: "/",
    });
    res.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: `.${rootDomain}`,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
};
