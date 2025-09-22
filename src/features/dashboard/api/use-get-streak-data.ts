import { useCurrentUser } from "@/hooks/use-current-user";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetStreakData = () => {

  return useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const response = await apiClient(`/api/streak`);
      return response.data;
    },
  });
};
