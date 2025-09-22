import apiClient from "@/lib/api";
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
      const res = await apiClient("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      });

      if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return res.data as ResponseT;
    },
  });
};
