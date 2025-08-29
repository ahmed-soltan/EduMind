import { useQuery } from "@tanstack/react-query";
import { cache } from "react";

export const useGetPlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Network response was not ok");
      const result = await res.json();
      return result;
    },
  });
};
