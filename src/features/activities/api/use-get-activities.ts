import { UserActivity } from "@/db/types";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetActivities = () => {
  return useQuery<any, Error, UserActivity[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await apiClient("/api/activities");
      return res.data;
    },
  });
};
