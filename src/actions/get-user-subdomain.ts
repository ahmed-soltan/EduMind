import { db } from "@/db/conn";
import { settings } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { eq } from "drizzle-orm";

export const getUserSubdomain = async () => {
  const session = await getUserSession();

  if (!session.isAuthenticated) return null;

  const [userSettings] = await db
    .select({ subdomain: settings.subdomain })
    .from(settings)
    .where(eq(settings.userId, session.user.id));

    return userSettings.subdomain;
};
