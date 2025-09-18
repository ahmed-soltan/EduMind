import { InvitationCard } from "@/features/invite/components/invitation-card";
import { getUserSession } from "@/utils/get-user-session";
import { redirect } from "next/navigation";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: { token?: string; tenant?: string };
}) {
  const session = await getUserSession();

  const token = await searchParams.token;
  const subdomain = await searchParams.tenant;

  if (!session.isAuthenticated) {
    redirect(`/auth/signup?callback=/invite?token=${token}&tenant=${subdomain}`);
  }

  return <div>
    <InvitationCard />
  </div>;
}
