import apiClient from "@/lib/api";
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
      const res = await apiClient("/api/subscriptions/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        data: JSON.stringify(data),
      });
      
      return res.data;
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
