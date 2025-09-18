import { useMutation } from "@tanstack/react-query";

type RequestT = {
  planId: number;
  billingCycle: "monthly" | "annual";
  planName: string;
};

type ResponseT = {
  checkoutUrl: string;
};

export const useSubscribe = () => {
  return useMutation<ResponseT, Error, RequestT>({
    mutationFn: async (data) => {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      return result as ResponseT;
    },
  });
};
