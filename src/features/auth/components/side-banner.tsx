import { Logo } from "@/components/logo";
import { AuroraBackground } from "@/components/ui/aurora-background";
import React from "react";

export const SideBanner = () => {
  return (
    <AuroraBackground>
      <div className="flex items-center flex-col gap-2 text-white">
        <Logo/>
        <h1 className="text-3xl font-medium line-clamp-5 text-center leading-12">Your Personal AI Study Buddy <br/> Learn Smarter, Faster</h1>
      </div>
    </AuroraBackground>
  );
};
