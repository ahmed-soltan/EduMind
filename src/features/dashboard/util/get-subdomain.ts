export function getSubdomain(host: string | null) {
  if (!host) return null;

  // Remove port if exists
  const cleanHost = host.split(":")[0]; // "ahmed.localhost"

  const parts = cleanHost.split(".");

  // On localhost without subdomain => ["localhost"]
  if (parts.length < 2) return null;

  // Subdomain.localhost => return first part
  return parts[0];
}
