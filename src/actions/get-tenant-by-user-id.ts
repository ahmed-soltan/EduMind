import { db } from "@/db/conn";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getTenantByUserId = async (userId: string) => {
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.ownerId, userId));
  return tenant;
};
