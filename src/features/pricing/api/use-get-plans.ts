import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { cache } from "react";

export const useGetPlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await apiClient("/api/plans");
      if (res.status !== 200) throw new Error("Network response was not ok");
      return res.data;
    },
  });
};
