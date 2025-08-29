"use client";

import dynamic from "next/dynamic";

const PricingDynamic = dynamic(
  () =>
    import("@/features/pricing/components/pricing").then(
      (mod) => mod.Pricing
    ),
  { ssr: false }
);

export const PricingWrapper = () => {
  return <PricingDynamic />;
};
