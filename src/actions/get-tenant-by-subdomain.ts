import { db, redis } from "@/db/conn";
import { tenants } from "@/db/schema";
import { Tenant } from "@/db/types";
import { eq } from "drizzle-orm";

export const getTenantBySubdomain = async (
  subdomain: string
): Promise<Tenant | null> => {
  const tenant = (await redis.get(`tenant:${subdomain}`)) as Tenant;

  if (tenant) {
    return tenant;
  }

  const [dbTenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.subdomain, subdomain));

  if (dbTenant) {
    await redis.set(`tenant:${subdomain}`, dbTenant);
  }

  return dbTenant || null;
};
