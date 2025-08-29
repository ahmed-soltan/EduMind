import { OnboardingWrapper } from "@/features/onboarding/components/onboarding-wrapper";
import { getUserSession } from "@/utils/get-user-session";
import { redirect } from "next/navigation";

const OnboardingPage = async () => {
  const userSession = await getUserSession();

  if (!userSession) redirect("/auth/login");
  return <OnboardingWrapper />;
};

export default OnboardingPage;
