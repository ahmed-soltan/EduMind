"use client";

import dynamic from "next/dynamic";

const WizardFormDynamic = dynamic(
  () =>
    import("@/features/onboarding/components/wizard-form").then(
      (mod) => mod.WizardForm
    ),
  { ssr: false }
);

export const OnboardingWrapper = () => {
  return (
    <div>
      <WizardFormDynamic />
    </div>
  );
};
