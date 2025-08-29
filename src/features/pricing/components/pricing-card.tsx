import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Plan } from "../types";
import { usePathname } from "next/navigation";
import { resolveRedirect } from "../utils";
import { useCurrentUser } from "@/hooks/use-current-user";

interface PricingCardProps {
  plan: Plan;
  isAnnual: boolean;
}

export const PricingCard = ({ plan, isAnnual }: PricingCardProps) => {
  const pathname = usePathname();
  const { data: userData, isLoading: isLoadingUser } = useCurrentUser();

  const { target } = resolveRedirect(userData, plan);

  const price = isAnnual
    ? (plan.annualPrice / 100).toFixed(2)
    : (plan.price / 100).toFixed(2);

  return (
    <div key={plan.id} className="relative">
      {plan.name === "Pro" && (
        <span className="bg-linear-to-br absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-blue-500 to-blue-300 px-3 py-1 text-xs font-medium text-blue-950 ring-1 ring-inset">
          Popular
        </span>
      )}
      <Card className="flex flex-col h-[350px]">
        <CardHeader>
          <CardTitle className="font-medium">{plan.name}</CardTitle>
          <span className="my-3 block text-2xl font-semibold">
            {isAnnual ? `$${price} / yr` : `$${price} / mo`}
          </span>
          {plan.name === "Team" && (
            <CardDescription className="text-sm">Per Member</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <hr className="border-dashed" />

          <ul className="list-outside space-y-3 text-sm">
            {plan.features.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="size-3" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="mt-auto">
          <Button
            asChild
            variant={plan.name === "Pro" ? "default" : "outline"}
            className="w-full"
          >
            <Link href={`/${target}`}>Get Started</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
