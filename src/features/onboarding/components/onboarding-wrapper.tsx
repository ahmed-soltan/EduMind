"use client";

import dynamic from "next/dynamic";

const WizardFormDynamic = dynamic(
  () =>
    import("@/features/onboarding/components/wizard-form").then(
      (mod) => mod.WizardForm
    ),
  { ssr: false }
);

export const OnboardingWrapper = ({tenantId}: {tenantId: string}) => {
  return (
    <div>
      <WizardFormDynamic tenantId={tenantId} />
    </div>
  );
};
