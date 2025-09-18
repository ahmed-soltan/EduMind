import { sql } from "drizzle-orm";

import { db } from "@/db/conn";
import { permissions, rolePermission } from "@/db/schema";

export const hasPermission = async (roleId: string, permissionName: string) => {
  const result = await db.execute<{ exists: boolean }>(
    sql`SELECT EXISTS (
      SELECT 1
      FROM ${rolePermission}
      JOIN ${permissions}
        ON ${permissions}.id = ${rolePermission}.permission_id
      WHERE ${rolePermission}.role_id = ${roleId}
        AND ${permissions}.name = ${permissionName}
    ) as "exists"`
  );

  // result.rows[0].exists will be true/false
  return result.rows[0]?.exists ?? false;
};
