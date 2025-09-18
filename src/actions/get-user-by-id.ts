import { db } from "@/db/conn";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserById = async (userId: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  return user;
};
