import { useState } from "react";

import { PricingCard } from "./pricing-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Plan } from "../types";

import { useGetPlans } from "../api/use-get-plans";
import { Skeleton } from "@/components/ui/skeleton";

export const Pricing = () => {
  const { data, isLoading } = useGetPlans();
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            Pricing that Scales with You
          </h1>
          <p>
            Unlock AI answers, auto-quizzes, flashcards, and progress tracking{" "}
            <br /> built to help students learn faster.
          </p>
        </div>
        <Tabs
          defaultValue="monthly"
          className="w-[375px] mx-auto my-10 text-sm text-muted-foreground"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:border-blue-500"
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="annual"
              className="data-[state=active]:border-blue-500"
              onClick={() => setIsAnnual(true)}
            >
              Annual
            </TabsTrigger>
          </TabsList>
        </Tabs>
          {isLoading && (
            <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3 w-full">
              <Skeleton className="h-[350px] w-full rounded-md" />
              <Skeleton className="h-[350px] w-full rounded-md" />
              <Skeleton className="h-[350px] w-full rounded-md" />
            </div>
          )}
        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
          {data &&
            data.plans.map((plan: Plan) => {
              return (
                <PricingCard key={plan.id} plan={plan} isAnnual={isAnnual} />
              );
            })}
        </div>
      </div>
    </section>
  );
};
