import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
    expires: new Date(0),
  });
  res.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
    expires: new Date(0),
  });
  return res;
};
