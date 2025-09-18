import { OnboardingWrapper } from "@/features/onboarding/components/onboarding-wrapper";
import { getUserSession } from "@/utils/get-user-session";
import { redirect } from "next/navigation";

const OnboardingPage = async ({params}:{params: Promise<{ tenantId: string }>}) => {
  const userSession = await getUserSession();
  const { tenantId } = await params;

  if (!userSession) redirect("/auth/login");
  return <OnboardingWrapper tenantId={tenantId} />;
};

export default OnboardingPage;
