import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetMembers = () => {
  return useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await apiClient("/api/members");
      if (res.status !== 200) throw new Error("Network response was not ok");
      return res.data;
    },
  });
};
