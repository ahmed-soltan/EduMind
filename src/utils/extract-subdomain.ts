import { rootDomain } from "@/lib/utils";
import { NextRequest } from "next/server";

export function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]; // strip port if exists

  // Local development: support localhost, 127.0.0.1, and lvh.me
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".lvh.me") ||
    hostname === "lvh.me"
  ) {
    // sub.localhost
    const localhostMatch = hostname.match(/^([^.]+)\.localhost$/);
    if (localhostMatch) return localhostMatch[1];

    // sub.lvh.me
    const lvhMatch = hostname.match(/^([^.]+)\.lvh\.me$/);
    if (lvhMatch) return lvhMatch[1];

    return null;
  }

  // Production environment: use configured rootDomain
  const rootDomainFormatted = (rootDomain || "").split(":")[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection (e.g. ahmed.example.com)
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}
