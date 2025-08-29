// utils/auth.ts
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.ACCESS_SECRET!);

const baseUrl =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    : "";

/**
 * Return:
 * {
 *   isAuthenticated: boolean,
 *   userId: string | null,
 *   newAccessToken?: string | null,
 *   newRefreshToken?: string | null
 * }
 */
export async function checkAuth(req: NextRequest, token?: string) {
  const verify = async (t: string) => {
    const { payload } = await jwtVerify(t, secret);
    return payload as Record<string, any>;
  };

  // try verifying provided access token
  if (token) {
    try {
      const payload = await verify(token);
      return {
        isAuthenticated: true,
        userId: payload?.userId ?? null,
        newAccessToken: null,
        newRefreshToken: null,
      };
    } catch (err: any) {
      const isExpired = err?.code === "ERR_JWT_EXPIRED" || err?.name === "TokenExpiredError";
      if (!isExpired) {
        return { isAuthenticated: false, userId: null, newAccessToken: null, newRefreshToken: null };
      }
      // expired -> try refresh below
    }
  }

  // no token or expired -> try to refresh using server-to-server fetch and forward the incoming cookies
  try {
    const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        // forward cookie header from the incoming request so the refresh endpoint can read the refresh token
        cookie: req.headers.get("cookie") || "",
        "content-type": "application/json",
      },
    });

    if (!refreshRes.ok) {
      return { isAuthenticated: false, userId: null, newAccessToken: null, newRefreshToken: null };
    }

    const data = await refreshRes.json();
    const newToken = data?.accessToken ?? null;
    const newRefresh = data?.refreshToken ?? null;

    if (!newToken) {
      return { isAuthenticated: false, userId: null, newAccessToken: null, newRefreshToken: null };
    }

    // verify newly minted access token
    try {
      const payload = await verify(newToken);
      return {
        isAuthenticated: true,
        userId: payload?.userId ?? null,
        newAccessToken: newToken,
        newRefreshToken: newRefresh ?? null,
      };
    } catch {
      return { isAuthenticated: false, userId: null, newAccessToken: null, newRefreshToken: null };
    }
  } catch {
    return { isAuthenticated: false, userId: null, newAccessToken: null, newRefreshToken: null };
  }
}
