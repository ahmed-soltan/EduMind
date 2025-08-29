// app/utils/get-user-session.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { User } from "@/db/types";

export type Session = {
  isAuthenticated: boolean;
  user: any | null;
  refreshed?: boolean;
};

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_SECRET!);

export async function getUserSession(): Promise<Session> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) return { isAuthenticated: false, user: null };

  try {
    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);

    return { isAuthenticated: true, user: (payload as any).user as User };
  } catch {
    // expired or invalid — middleware should try refresh & set cookie
    return { isAuthenticated: false, user: null };
  }
}
