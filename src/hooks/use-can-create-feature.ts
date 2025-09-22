// hooks/use-can-create.ts
"use client";

import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useCanCreate = (feature: string) => {
  return useQuery({
    queryKey: ["can-create", feature],
    queryFn: async () => {
      const res = await apiClient(`/api/features/can-create?feature=${feature}`, {
        method: "GET",
      });
      if (res.status !== 200) {
        throw new Error("Failed to fetch feature limits");
      }
      return res.data;
    },
  });
};
