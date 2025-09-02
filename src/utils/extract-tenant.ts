import { NextRequest } from "next/server";
import { extractSubdomain as hostExtractSubdomain } from "./extract-subdomain"; // your host-based extractor, keep for prod

const RESERVED_FIRST_SEGMENTS = new Set([
  "api",
  "_next",
  "auth",
  "admin",
  "favicon.ico",
  "static",
  "login",
  "logout",
  "public",
]);

/**
 * Try host-based subdomain first (tenant.example.com).
 * If not found, try path-based tenant: first pathname segment (e.g. /tenant/...).
 * Returns tenant string or null.
 */
export function extractTenant(request: NextRequest): string | null {
  // 1) Host-based (production)
  const hostTenant = hostExtractSubdomain(request);
  if (hostTenant) return hostTenant;

  // 2) Path-based (app folder: /[subdomain]/...)
  const pathname = request.nextUrl.pathname; // normalized path, always starts with "/"
  const segments = pathname.split("/").filter(Boolean); // removes empty strings
  if (segments.length === 0) return null;

  const first = segments[0].toLowerCase();
  if (!first) return null;
  if (RESERVED_FIRST_SEGMENTS.has(first)) return null;

  // optional: add extra validation (length, allowed chars)
  const isValid = /^[a-z0-9-]{1,63}$/.test(first);
  return isValid ? first : null;
}
