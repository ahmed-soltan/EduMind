import { type NextRequest, NextResponse } from "next/server";
import { APP_ORIGIN } from "@/lib/utils"; // e.g. "lvh.me" or "example.com"
import { extractSubdomain } from "./utils/extract-subdomain";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tenantRoutes = ["/dashboard"]; // extend as needed
  const isTenantRoute = tenantRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const res = NextResponse.next();

  const subdomain = extractSubdomain(request);

  if (subdomain && isTenantRoute) {
    const userSubdomain = request.cookies.get("subdomain")?.value;

    // If the token contains a subdomain claim, enforce it
    if (subdomain) {
      if (userSubdomain !== subdomain) {
        // user belongs to different tenant; send them to root dashboard
        return NextResponse.redirect(`${APP_ORIGIN}`);
      }
    }

    // Continue and rewrite to tenant route
    if (
      pathname === "/" ||
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/")
    ) {
      const dest = `/s/${subdomain}${pathname === "/" ? "" : pathname}`;
      const rewriteRes = NextResponse.rewrite(new URL(dest, request.url));

      return rewriteRes;
    }
  }

  // default: return the response that already has cookies attached (if any)
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|[\\w-]+\\.\\w+).*)"],
};
