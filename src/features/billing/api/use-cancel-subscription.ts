import apiClient from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export const useCancelSubscription = () => {
  return useMutation({
    mutationFn: async (subscriptionId:string) => {
      const res = await apiClient(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
    },
  });
};
