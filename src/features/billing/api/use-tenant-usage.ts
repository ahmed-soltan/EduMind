import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useTenantUsage = () => {
  return useQuery({
    queryKey: ["tenant-usage"],
    queryFn: async () => {
      const res = await apiClient("/api/features/usage", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    },
  });
};
