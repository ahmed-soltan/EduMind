import { type NextRequest, NextResponse } from "next/server";
import { APP_DOMAIN, APP_ORIGIN, AUTH_ORIGIN, buildRootLoginUrl, protocol, rootDomain } from "@/lib/utils"; // e.g. "lvh.me" or "example.com"
import { extractSubdomain } from "./utils/extract-subdomain";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_SECRET!);

/**
 * Try to validate the access token; if invalid, call existing refresh endpoint.
 * Returns { payload, tokens? } or null.
 * - payload: token payload (object)
 * - tokens: { accessToken, refreshToken } when refresh succeeded
 */
async function verifyOrRefresh(request: NextRequest) {
  const access = request.cookies.get("accessToken")?.value;

  // 1) if access token exists, try to verify it.
  if (access) {
    try {
      const verified = await jwtVerify(access, ACCESS_SECRET);
      const payload = (verified as any).payload;

      // if token doesn't carry a user object, treat as invalid and try refresh
      if (!payload?.user) {
        throw new Error("access token missing user");
      }

      return { payload }; // good access token, no new tokens
    } catch {
      // continue to refresh attempt
    }
  }

  // 2) attempt refresh via your existing refresh endpoint
  try {
    const refreshUrl = `${AUTH_ORIGIN.replace(/\/$/, "")}/api/auth/refresh`;
    const refreshRes = await fetch(refreshUrl, {
      method: "POST",
      // forward cookies from incoming request so server can read refresh token cookie
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    if (!refreshRes.ok) return null;

    // your refresh endpoint returns JSON with tokens (your existing implementation)
    const body = await refreshRes.json();
    const newAccessToken: string | undefined = body?.accessToken;
    const newRefreshToken: string | undefined = body?.refreshToken;
    if (!newAccessToken) return null;

    // verify returned new access token to extract payload
    const verifiedNew = await jwtVerify(newAccessToken, ACCESS_SECRET);
    const payload = (verifiedNew as any).payload;

    // require payload.user to exist; if not, treat as fail
    if (!payload?.user) return null;

    return {
      payload,
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    };
  } catch {
    return null;
  }
}

// helper: decide cookie options and attach cookies to the provided response
function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken?: string; refreshToken?: string } | undefined,
  request: NextRequest
) {
  if (!tokens) return;

  const host = request.headers.get("host") ?? request.nextUrl.hostname;
  const isLocal = /^localhost(:\d+)?$/.test(host) || host.startsWith("127.") || host === "::1";

  const cookieOptions: Record<string, any> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  // only set domain in non-local environments and when rootDomain is available
  if (!isLocal && rootDomain) {
    cookieOptions.domain = `.${rootDomain}`;
  }

  if (tokens.accessToken) {
    response.cookies.set("accessToken", tokens.accessToken, cookieOptions);
  }
  if (tokens.refreshToken) {
    response.cookies.set("refreshToken", tokens.refreshToken, cookieOptions);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tenantRoutes = ["/dashboard"]; // extend as needed
  const isTenantRoute = tenantRoutes.some((route) => pathname.startsWith(route));

  // special-case: auth pages
  if (pathname.startsWith("/auth")) {
    const verified = await verifyOrRefresh(request);

    // if logged in (or refresh succeeded) -> redirect away from /auth pages
    if (verified?.payload) {
      // prefer tenant subdomain in token if present

      const subdomain = request.cookies.get("subdomain")?.value;
      const redirectTarget = subdomain
        ? `${protocol}://${subdomain}.${APP_DOMAIN}/dashboard`
        : `${APP_ORIGIN}/`;

      const redirectRes = NextResponse.redirect(redirectTarget);

      // attach refreshed cookies if refresh returned tokens (on the response we will return)
      setAuthCookies(redirectRes, verified.tokens, request);

      // include x-user-id header for downstream servers if available
      if (verified.payload?.user?.userId) {
        redirectRes.headers.set("x-user-id", String(verified.payload.user.userId));
      }

      return redirectRes;
    }

    // not authenticated -> let /auth pages render
    return NextResponse.next();
  }

  // For other routes: verify or refresh
  const result = await verifyOrRefresh(request);

  // If this route requires tenant auth and verify/refresh failed -> redirect to central login
  if (!result && isTenantRoute) {
    return NextResponse.redirect(buildRootLoginUrl());
  }

  // Build response (default) — we will set cookies on whichever response we return
  const res = NextResponse.next();

  // If we have refreshed tokens, attach them to the response we'll return
  setAuthCookies(res, result?.tokens, request);

  // now extract payload from result for tenant handling
  const payload = result?.payload ?? null;

  // Tenant route handling:
  // - If subdomain present in host and route is tenant-route, require payload (authenticated)
  // - If payload includes user.subdomain, enforce it matches host subdomain
  const subdomain = extractSubdomain(request);

  if (subdomain && isTenantRoute) {
    if (!payload) {
      // not authenticated
      return NextResponse.redirect(buildRootLoginUrl());
    }

    const userSubdomain = request.cookies.get("subdomain")?.value;

    // If the token contains a subdomain claim, enforce it
    if (subdomain) {
      if (userSubdomain !== subdomain) {
        // user belongs to different tenant; send them to root dashboard
        return NextResponse.redirect(`${APP_ORIGIN}`);
      }
    }

    // Continue and rewrite to tenant route
    if (pathname === "/" || pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      const dest = `/s/${subdomain}${pathname === "/" ? "" : pathname}`;
      const rewriteRes = NextResponse.rewrite(new URL(dest, request.url));

      // IMPORTANT: set cookies on the rewriteRes (the response we'll return)
      setAuthCookies(rewriteRes, result?.tokens, request);

      // preserve x-user-subdomain header
      if (subdomain) {
        rewriteRes.headers.set("x-user-subdomain", String(subdomain));
      }

      return rewriteRes;
    }
  }

  // default: return the response that already has cookies attached (if any)
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|[\\w-]+\\.\\w+).*)"],
};
