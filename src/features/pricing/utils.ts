import { Plan } from "./types";

type User = {
  plan?: { id: string; name?: string } | null;
  hasOnboarded?: boolean | null;
};


export type RedirectTarget = "none" | "auth" | "dashboard" | "onboarding" | "payment";

export function resolveRedirect(user: User | null | undefined, plan: Plan | null | undefined) {
  // defensive defaults
  const hasUser = !!user;
  const userHasPlan = !!(user && user.plan && user.plan.id);
  const userPlanId = user?.plan?.id ?? null;
  const userHasOnboarded = user?.hasOnboarded ?? false;

  const planIsFree = (plan?.name ?? "").toLowerCase() === "free";
  const planId = plan?.id ?? null;

  // 1) Not authenticated -> auth page
  if (!hasUser) {
    return { target: "signup" as const, reason: "no user" };
  }

  // 5) If user hasn't onboarded yet -> onboarding (before payment)
  if (!userHasOnboarded) {
    return { target: `onboarding/${planId}` as const, reason: "user not onboarded" };
  }

  // 2) If target plan is free -> go to dashboard (no purchase required)
  if (planIsFree) {
    return { target: "dashboard" as const, reason: "selected plan is Free" };
  }

  // 3) If user already has the plan -> dashboard
  if (userHasPlan && userPlanId === planId) {
    return { target: "dashboard" as const, reason: "user already on this plan" };
  }


  // 5) Otherwise user is authenticated, not on plan, plan isn't free -> payment
  return { target: "payment" as const, reason: "needs to pay/upgrade" };
}
