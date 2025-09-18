// hooks/use-can-create.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export const useCanCreate = (feature: string) => {
  return useQuery({
    queryKey: ["can-create", feature],
    queryFn: async () => {
      const res = await fetch(`/api/features/usage?features=${feature}`);
      if (!res.ok) {
        throw new Error("Failed to fetch feature limits");
      }
      return res.json();
    },
  });
};
