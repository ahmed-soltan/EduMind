import { rootDomain } from "@/lib/utils";
import { NextRequest } from "next/server";

export function extractSubdomain(request: NextRequest): string | null {
  // Prefer x-forwarded-host (proxies), then Host header, then URL hostname
  const forwarded = request.headers.get("x-forwarded-host");
  const hostHeader = forwarded ?? request.headers.get("host") ?? "";
  // strip port if present
  const hostname = (hostHeader.split(":")[0] || new URL(request.url).hostname).toLowerCase();

  // ---- Local development ----
  // Examples: tenant.localhost, localhost, 127.0.0.1
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }
  if (hostname.endsWith(".localhost")) {
    // tenant.localhost -> "tenant"
    // handle multi-level names like foo.bar.localhost -> "foo.bar"
    return hostname.replace(/\.localhost$/, "");
  }

  // ---- Vercel preview domains ----
  // tenant---branch.vercel.app -> tenant
  if (hostname.endsWith(".vercel.app") && hostname.includes("---")) {
    return hostname.split("---")[0];
  }

  // ---- Production / normal domains ----
  const rootDomainFormatted = rootDomain.split(":")[0].toLowerCase();
  if (!rootDomainFormatted) return null;

  // If host equals root domain or www.rootDomain => no subdomain
  if (hostname === rootDomainFormatted || hostname === `www.${rootDomainFormatted}`) {
    return null;
  }

  // If host ends with ".rootDomain", return the left-most part(s) as the subdomain
  if (hostname.endsWith(`.${rootDomainFormatted}`)) {
    return hostname.slice(0, -(`.${rootDomainFormatted}`).length);
  }

  // Fallback: no subdomain detected
  return null;
}
