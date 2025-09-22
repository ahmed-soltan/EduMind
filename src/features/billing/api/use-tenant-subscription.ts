import { TenantSubscription } from "@/db/types";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useTenantSubscription = () => {
  return useQuery<void, Error, TenantSubscription>({
    queryKey: ["tenant-subscription"],
    queryFn: async () => {
      const res = await apiClient("/api/subscriptions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    },
  });
};
