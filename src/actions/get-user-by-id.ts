import { db } from "@/db/conn";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserById = async (id: string) => {
  const [existingUser] = await db
    .select({
        email: users.email,
        password: users.password,
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.id, id));



    return existingUser;
};
