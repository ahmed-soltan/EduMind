import { useQuery } from "@tanstack/react-query";

export const useTenantUsage = () => {
  return useQuery({
    queryKey: ["tenant-usage"],
    queryFn: async () => {
      const res = await fetch("/api/features/usage", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch tenant usage");
      }
      return res.json();
    },
  });
};
