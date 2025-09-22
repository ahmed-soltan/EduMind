import { UserActivity } from "@/db/types";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetRecentActivities = () => {
  return useQuery<any, Error, UserActivity[]>({
    queryKey: ["recentActivities"],
    queryFn: async () => {
      const response = await apiClient("/api/activities?limit=5", {
        method: "GET",
      });
      return response.data;
    },
  });
};
