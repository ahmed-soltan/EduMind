import { CheckCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useGetPlans } from "@/features/pricing/api/use-get-plans";
import { useTenantSubscription } from "../api/use-tenant-subscription";
import { useUpgradeSubscription } from "../api/use-upgrade-subscription";

export const PlansTab = () => {
  const { data: plans, isLoading: plansLoading } = useGetPlans();
  const { data: subscription, isLoading: subscriptionLoading } =
    useTenantSubscription();
  const { mutateAsync: upgradeSubscription, isPending: isUpgrading } =
    useUpgradeSubscription();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    planId: string;
    planName: string;
    planPrice: number;
  }>({
    isOpen: false,
    planId: "",
    planName: "",
    planPrice: 0,
  });

  const isLoading = plansLoading || subscriptionLoading;

  const handlePlanSelect = (
    planId: string,
    planName: string,
    planPrice: number
  ) => {
    setConfirmDialog({
      isOpen: true,
      planId,
      planName,
      planPrice,
    });
  };

  const confirmPlanChange = async () => {
    const billingCycle =
      (subscription?.subscriptions.billingCycle as "monthly" | "yearly") ||
      "monthly";
    const { newSubscription } = await upgradeSubscription({
      planId: confirmDialog.planId,
      billingCycle,
    });
    if (newSubscription) {
      window.location.href = newSubscription.checkoutUrl;
    }
    setConfirmDialog({ isOpen: false, planId: "", planName: "", planPrice: 0 });
  };

  const PlanCardSkeleton = () => (
    <div className="p-4 border border-neutral-500 rounded-lg w-full">
      <Skeleton className="h-6 w-24 mb-2" />
      <Skeleton className="h-8 w-20 mb-4" />
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <Card className="w-full border-neutral-500">
      <CardHeader>
        <CardTitle>Available Plans</CardTitle>
        <CardDescription>
          Compare plans and upgrade your subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center flex-wrap gap-4">
          {isLoading ? (
            <>
              <PlanCardSkeleton />
              <PlanCardSkeleton />
              <PlanCardSkeleton />
            </>
          ) : (
            plans?.plans.map((plan: any) => {
              const isCurrentPlan = subscription?.plans.id === plan.id;
              const isDisabled = isCurrentPlan || isUpgrading;

              return (
                <div
                  key={plan.id}
                  className="p-4 border border-neutral-500 rounded-lg w-full"
                >
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-2xl font-bold">{plan.currency.toUpperCase()} {plan.cents / 100}/mo</p>
                  <ul className="mt-2 space-y-1">
                    {plan.features?.map((feature: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm flex items-center gap-2"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isDisabled}
                    onClick={() =>
                      !isDisabled &&
                      handlePlanSelect(plan.id, plan.name, plan.cents)
                    }
                  >
                    {isUpgrading
                      ? "Updating..."
                      : isCurrentPlan
                      ? "Current Plan"
                      : "Select Plan"}
                  </Button>
                </div>
              );
            }) || <p className="text-muted-foreground">Loading plans...</p>
          )}
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change your subscription to the{" "}
              <strong>{confirmDialog.planName}</strong> plan for{" "}
              <strong>${confirmDialog.planPrice / 100}/month</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
              }
              disabled={isUpgrading}
            >
              Cancel
            </Button>
            <Button onClick={confirmPlanChange} disabled={isUpgrading}>
              {isUpgrading ? "Processing..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
