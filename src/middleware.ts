// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { protocol, rootDomain } from "@/lib/utils"; // make sure this returns e.g. "example.com"
import { extractSubdomain } from "./utils/extract-subdomain";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_SECRET!);

function buildRootLoginUrl(): string {
  const loginUrl = `${protocol}://${rootDomain}/auth/login`;

  return loginUrl;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const tenantRoutes = ["/dashboard"];
  const isTenantRoute = tenantRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }
  // Authentication cookie handling (token verification / refresh)
  const access = request.cookies.get("accessToken")?.value;
  // If no access token, allow page to handle login / redirect

  if (!access && isTenantRoute) {
    return NextResponse.redirect(buildRootLoginUrl());
  }

  if(!access){
    return NextResponse.next();
  }

  let payload: any = null;
  let refreshed = false;
  let newAccessToken: string | undefined;
  let newRefreshToken: string | undefined;

  try {
    const verified = await jwtVerify(access, ACCESS_SECRET);
    payload = (verified as any).payload;
    // If you use some payload shape, check accordingly. If invalid, attempt refresh below.
    if (!payload?.user) {
      // fallthrough to refresh logic (same as below)
      throw new Error("no user in payload");
    }
  } catch (err: any) {
    // Try to refresh when token invalid/expired
    try {
      const refreshUrl = new URL("/api/auth/refresh", request.url).toString();
      const refreshRes = await fetch(refreshUrl, {
        method: "POST",
        // forward cookies to refresh endpoint (it must read refreshToken cookie)
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });

      if (!refreshRes.ok) {
        // refresh failed => redirect to login (on the current host)
        console.log("first")
        return NextResponse.redirect(buildRootLoginUrl());
      }

      const body = await refreshRes.json();
      newAccessToken = body?.accessToken;
      newRefreshToken = body?.refreshToken;

      if (newAccessToken) {
        const verifiedNew = await jwtVerify(newAccessToken, ACCESS_SECRET);
        payload = (verifiedNew as any).payload;
        refreshed = true;
      } else {
        return NextResponse.redirect(buildRootLoginUrl());
      }
    } catch (refreshErr) {
      return NextResponse.redirect(buildRootLoginUrl());
    }
  }

  // continue the request, attach refreshed cookies if we got new tokens
  const res = NextResponse.next();

  if (refreshed && newAccessToken) {
    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      path: "/",
      domain: `.${rootDomain}`,
    });

    if (newRefreshToken) {
      res.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
        path: "/",
        domain: `.${rootDomain}`,
      });
    }
  }

  const subdomain = extractSubdomain(request);


  // If this is a subdomain, rewrite routes to your /s/[subdomain] routes
  console.log(subdomain);
  if (subdomain && isTenantRoute) {
    if (subdomain !== payload?.user?.subdomain) {
      return NextResponse.redirect(`${protocol}://${rootDomain}`);
    }
    // protect admin from subdomains
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      pathname === "/" ||
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/")
    ) {
      const dest = `/s/${subdomain}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(new URL(dest, request.url));
    }

    // if you have many tenant routes, you can rewrite more broadly:
    // if (pathname.startsWith("/(app|settings|courses)")) { ... }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|[\\w-]+\\.\\w+).*)"],
};
