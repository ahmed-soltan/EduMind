import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useCurrentMember = () => {
  return useQuery({
    queryKey: ["currentMember"],
    queryFn: async () => {
      const response = await apiClient("/api/members/current-member");
      return response.data;
    },
  });
};
