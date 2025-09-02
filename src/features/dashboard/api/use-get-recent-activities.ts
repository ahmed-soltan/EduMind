import { UserActivity } from "@/db/types";
import { useQuery } from "@tanstack/react-query";

export const useGetRecentActivities = () => {
  return useQuery<any, Error, UserActivity[]>({
    queryKey: ["recentActivities"],
    queryFn: async () => {
      const response = await fetch("/api/activities?limit=5");
      if (!response.ok) {
        throw new Error("Failed to fetch recent activities");
      }
      return response.json();
    },
  });
};
