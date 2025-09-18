import { TenantSubscription } from "@/db/types";
import { useQuery } from "@tanstack/react-query";

export const useTenantSubscription = () => {
  return useQuery<void, Error, TenantSubscription>({
    queryKey: ["tenant-subscription"],
    queryFn: async () => {
      const res = await fetch("/api/subscriptions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch tenant subscription");
      }
      return res.json();
    },
  });
};
