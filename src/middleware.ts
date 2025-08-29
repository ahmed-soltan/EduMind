import { type NextRequest, NextResponse } from "next/server";
import { rootDomain } from "@/lib/utils";
import { extractSubdomain } from "./utils/extract-subdomain";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_SECRET!);

export async function middleware(request: NextRequest) {
  const access = request.cookies.get("accessToken")?.value;

  // If there's no access token, let the request proceed (page can handle redirect/login).
  if (!access) return NextResponse.next();

  let payload: any = null;
  let refreshed = false;
  let newAccessToken: string | undefined;
  let newRefreshToken: string | undefined;

  try {
    const verified = await jwtVerify(access, ACCESS_SECRET);
    payload = (verified as any).payload;
    // If expired -> try to refresh
    if (!payload.user) {
      try {
        const refreshUrl = new URL("/api/auth/refresh", request.url).toString();
        const refreshRes = await fetch(refreshUrl, {
          method: "POST",
          // forward cookies so the refresh route can read refreshToken
          headers: {
            cookie: request.headers.get("cookie") ?? "",
          },
        });

        if (refreshRes.ok) {
          const body = await refreshRes.json();
          newAccessToken = body?.accessToken;
          if (newAccessToken) {
            // verify the newly returned token so we can get payload
            const verifiedNew = await jwtVerify(newAccessToken, ACCESS_SECRET);
            payload = (verifiedNew as any).payload;
            refreshed = true;
          }
        } else {
          // refresh failed: allow the request to continue (page can redirect to login)
          return NextResponse.redirect(new URL("/auth/login", request.url));
        }
      } catch (refreshErr) {
        // refresh attempt errored — allow request to continue
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } else {
      // other verification errors (invalid token etc.) — allow request to continue
      return NextResponse.next();
    }
  } catch (err: any) {
    if (err?.code === "ERR_JWT_EXPIRED") {
      try {
        const refreshUrl = new URL("/api/auth/refresh", request.url).toString();
        const refreshRes = await fetch(refreshUrl, {
          method: "POST",
          // forward cookies so the refresh route can read refreshToken
          headers: {
            cookie: request.headers.get("cookie") ?? "",
          },
        });

        if (refreshRes.ok) {
          const body = await refreshRes.json();
          newAccessToken = body?.accessToken;
          newRefreshToken = body?.refreshToken;

          if (newAccessToken) {
            // verify the newly returned token so we can get payload
            const verifiedNew = await jwtVerify(newAccessToken, ACCESS_SECRET);
            payload = (verifiedNew as any).payload;
            refreshed = true;
          }
        } else {
          // refresh failed: allow the request to continue (page can redirect to login)
          return NextResponse.redirect(new URL("/auth/login", request.url));
        }
      } catch (refreshErr) {
        // refresh attempt errored — allow request to continue
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } else {
      // other verification errors (invalid token etc.) — allow request to continue
      return NextResponse.next();
    }
  }

  // Build the response that will continue the chain (and potentially carry the new cookie)
  const res = NextResponse.next();

  // If we refreshed successfully, set the new access token cookie so browser is updated
  if (refreshed && newAccessToken) {
    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });
    if (newRefreshToken) {
      res.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
      });
    }
  }

  // Subdomain / routing rules (apply after successful verification / refresh)
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  if (subdomain) {
    // Block access to admin page from subdomains
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // For the root path on a subdomain, rewrite to the subdomain page
    if (pathname === "/dashboard") {
      return NextResponse.rewrite(new URL(`/${subdomain}`, request.url));
    }
  }

  // No special redirect / rewrite -> continue the request (with cookie possibly set)
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|[\\w-]+\\.\\w+).*)",
  ],
};
