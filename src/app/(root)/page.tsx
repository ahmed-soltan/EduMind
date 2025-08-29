import { CTASection } from "@/features/home/components/cta-section";
import { HeroSection } from "@/features/home/components/hero-section";
import { BenefitsSection } from "@/features/home/components/benefits-section";
import { FeaturesSection } from "@/features/home/components/features-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <CTASection />
    </div>
  );
}
