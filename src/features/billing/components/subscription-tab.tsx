import { useState } from "react";
import {
  Calendar,
  CheckCircle,
  Crown,
  DollarSign,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useTenantSubscription } from "../api/use-tenant-subscription";
import { useCancelSubscription } from "../api/use-cancel-subscription";
import { ConfirmModal } from "@/components/confirm-modal";

export const SubscriptionTab = () => {
  const { data, isLoading } = useTenantSubscription();
  const { mutate: cancelSubscription, isPending } = useCancelSubscription();
  const [isConfirming, setIsConfirming] = useState(false);

  const SubscriptionSkeleton = () => (
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-neutral-500 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="p-4 border border-neutral-500 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-36" />
      </div>
    </CardContent>
  );

  return (
    <>
      <ConfirmModal
        open={isConfirming}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period."
        setOpen={setIsConfirming}
        callbackFn={() => cancelSubscription(data?.subscriptions.id!)}
        isPending={isPending}
        variant={"destructive"}
      />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        {isLoading ? (
          <SubscriptionSkeleton />
        ) : (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div>
                <h3 className="font-semibold text-lg">{data?.plans.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {data?.subscriptions.billingCycle} billing
                </p>
              </div>
              <Badge
                variant={
                  data?.subscriptions.status === "active"
                    ? "default"
                    : "destructive"
                }
              >
                {data?.subscriptions.status === "active" ? (
                  <CheckCircle className="w-4 h-4 mr-1" />
                ) : (
                  <XCircle className="w-4 h-4 mr-1" />
                )}
                {data?.subscriptions.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {data?.subscriptions.renewalDate && (
                <div className="p-4 border border-neutral-500 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Next Billing</span>
                  </div>
                  <p className="text-sm">
                    {new Date(
                      data?.subscriptions.renewalDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="p-4 border border-neutral-500 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">Amount</span>
                </div>
                <p className="text-sm">
                  {(data?.subscriptions.price_cents! / 100).toFixed(2)}{" "}
                  {data?.subscriptions.currency?.toUpperCase()}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button variant="outline">Change Plan</Button>
              {data?.plans.name === "Free" ? null : (
                <Button
                  variant="destructive"
                  onClick={() => setIsConfirming(true)}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
};
