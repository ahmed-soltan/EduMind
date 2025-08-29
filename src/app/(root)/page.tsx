"use client"

import dynamic from "next/dynamic";

const FeaturesSectionDynamic = dynamic(
  () => import("@/features/home/components/features-section").then((mod) => mod.FeaturesSection),
  { ssr: false }
);

const HeroSectionDynamic = dynamic(
  () => import("@/features/home/components/hero-section").then((mod) => mod.HeroSection),
  { ssr: false }
);

const BenefitsSectionDynamic = dynamic(
  () => import("@/features/home/components/benefits-section").then((mod) => mod.BenefitsSection),
  { ssr: false }
);

const CTASectionDynamic = dynamic(
  () => import("@/features/home/components/cta-section").then((mod) => mod.CTASection),
  { ssr: false }
);

export default function Home() {
  return (
    <div>
      <HeroSectionDynamic />
      <FeaturesSectionDynamic />
      <BenefitsSectionDynamic />
      <CTASectionDynamic />
    </div>
  );
}
