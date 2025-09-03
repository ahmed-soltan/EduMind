// app/utils/get-user-session.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { User } from "@/db/types";

type UserSession = User & { subdomain: string };

export type Session =
  | {
      isAuthenticated: true;
      user: UserSession;
      refreshed?: boolean;
    }
  | {
      isAuthenticated: false;
      user: null;
      refreshed?: boolean;
    };

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_SECRET!);

export async function getUserSession(): Promise<Session> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  console.log({accessToken})

  if (!accessToken) return { isAuthenticated: false, user: null };

  try {
    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);

    console.log({payload})
    return {
      isAuthenticated: true,
      user: (payload as any).user as UserSession,
    };
  } catch {
    // expired or invalid — middleware should try refresh & set cookie
    return { isAuthenticated: false, user: null };
  }
}
