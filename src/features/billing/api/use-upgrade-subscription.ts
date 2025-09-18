import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UpgradeSubscriptionData {
  planId: string;
  billingCycle: "monthly" | "yearly";
}

interface UpgradeSubscriptionResponse {
  message: string;
  newSubscription: {
    checkoutUrl: string;
    intentionId: string;
    localSubscriptionId: string;
  };
}

export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<UpgradeSubscriptionResponse, Error, UpgradeSubscriptionData>({
    mutationFn: async (data: UpgradeSubscriptionData) => {
      const res = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upgrade subscription");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["tenant-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      
      toast.success("Subscription updated successfully! Your new plan is now active.");
    },
    onError: (error: Error) => {
      console.error("Subscription upgrade error:", error);
      toast.error(error.message || "Failed to upgrade subscription. Please try again.");
    },
  });
};
