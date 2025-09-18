import { Check, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

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

import { useSubscribe } from "../api/use-subscribe";

interface PricingCardProps {
  plan: Plan;
  isAnnual: boolean;
}

export const PricingCard = ({ plan, isAnnual }: PricingCardProps) => {
  const { mutateAsync, isPending } = useSubscribe();

  const price = isAnnual
    ? (plan.annualPrice / 100).toFixed(2)
    : (plan.cents / 100).toFixed(2);

  const handleSubscription = async () => {
    const { checkoutUrl } = await mutateAsync({
      planId: plan.id,
      billingCycle: isAnnual ? "annual" : "monthly",
      planName: plan.name,
    });

    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <div key={plan.id} className="relative">
      {plan.name === "Pro" && (
        <span className="bg-linear-to-br absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-blue-500 to-blue-300 px-3 py-1 text-xs font-medium text-blue-950 ring-1 ring-inset">
          Popular
        </span>
      )}
      <Card className="flex flex-col h-[720px]">
        <CardHeader>
          <CardTitle className="font-medium">{plan.name}</CardTitle>
          <span className="my-3 block text-2xl font-semibold">
            {isAnnual
              ? `${plan.currency.toUpperCase()} ${price} / yr`
              : `${plan.currency.toUpperCase()} ${price} / mo`}
          </span>
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
            variant={plan.name === "Pro" ? "default" : "outline"}
            className="w-full flex items-center"
            disabled={isPending}
            onClick={handleSubscription}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Get Started
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
