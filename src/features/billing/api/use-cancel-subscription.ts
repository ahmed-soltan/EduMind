import { useMutation } from "@tanstack/react-query";

export const useCancelSubscription = () => {
  return useMutation({
    mutationFn: async (subscriptionId:string) => {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    },
  });
};
