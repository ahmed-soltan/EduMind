import { type NextRequest, NextResponse } from "next/server";
import { rootDomain } from "@/lib/utils";
import { extractSubdomain } from "./utils/extract-subdomain";
import { jwtVerify } from "jose";
import { extractTenant } from "./utils/extract-tenant";

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

  const tenant = extractTenant(request); // tenant could be from host OR path

  // Decide which routes require tenant scoping
  // If your app uses /[tenant]/dashboard, treat routes that contain '/dashboard' after the tenant
  const pathname = request.nextUrl.pathname;

  // If tenant-path style: "/{tenant}/dashboard"  OR host-subdomain style: "/dashboard"
  const isTenantRoute =
    // host-based tenant: pathname startsWith '/dashboard'
    pathname.startsWith("/dashboard") ||
    // path-based tenant: pattern '/{tenant}/dashboard' (i.e., second segment is 'dashboard')
    /^\/[^/]+\/(dashboard|app|settings)(\/|$)/.test(pathname);

  // If a tenant-scoped route is hit but there's no tenant, block/redirect
  if (isTenantRoute && !tenant) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If tenant exists, check it matches the token payload (if authenticated)
  if (tenant) {
    const payloadTenant = (payload as any)?.user.subdomain; // or token.tenant
    if (payloadTenant && payloadTenant !== tenant) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If you used rewrite logic earlier, adapt it:
  // - For host-based subdomains you may rewrite '/' -> '/{tenant}'
  // - For path-based you DON'T need that rewrite because pages are already under /[tenant]
  if (tenant && request.nextUrl.pathname === "/dashboard") {
    // only rewrite if you expect host-based subdomains or want to transform behaviour
    // example: if host-based, rewrite '/dashboard' -> '/{tenant}'
    // if you are path-based, skip this rewrite
    return NextResponse.rewrite(new URL(request.nextUrl.pathname, request.url));
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
