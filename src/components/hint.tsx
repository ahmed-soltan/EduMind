"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HintProps {
  label: string;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  align?: "start" | "end" | "center";
}

export const Hint = ({
  label,
  children,
  side = "bottom",
  align = "start",
}: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="bg-black text-white border border-white/5"
        >
          <p className="text-xs font-medium">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

