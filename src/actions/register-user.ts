"use server";

import { signIn } from "@/auth"; // <-- NextAuth helper
import { db } from "@/db/conn";
import { users } from "@/db/schema";
import { signupSchema } from "@/features/auth/schemas";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import z from "zod";

export async function registerUser(data: z.infer<typeof signupSchema>) {
  // 1. Check if user already exists
  const existingUser = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.email, data.email));

  if (!existingUser) {
    throw new Error("Email already registered.");
  }

  // 2. Hash password
  const hashed = await bcrypt.hash(data.password, 10);

  // 3. Save new user
  await db.insert(users).values({
    id: crypto.randomUUID(),
    email: data.email,
    password: hashed,
    firstName: data.firstName,
    lastName: data.lastName,
  });

  // 4. Immediately sign them in
  const result = await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false, // prevent full redirect
  });

  return result;
}
