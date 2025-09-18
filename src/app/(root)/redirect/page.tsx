import { getTenantByUserId } from "@/actions/get-tenant-by-user-id";
import { getUserById } from "@/actions/get-user-by-id";
import { APP_DOMAIN, protocol } from "@/lib/utils";
import { getUserSession } from "@/utils/get-user-session";
import { redirect } from "next/navigation";

const RedirectPage = async () => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return redirect("/auth/login");
  }

  const tenant = await getTenantByUserId(session.user.id);
  const user = await getUserById(session.user.id);

  if (tenant && user?.hasOnboarded) {
    return redirect(
      `${protocol}://${tenant.subdomain}.${APP_DOMAIN}/dashboard`
    );
  } else if (tenant && !user?.hasOnboarded) {
    return redirect(`/onboarding/${tenant.id}`);
  } else {
    return redirect("/pricing");
  }
};

export default RedirectPage