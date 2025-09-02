import { UserActivity } from "@/db/types";
import { useQuery } from "@tanstack/react-query";

export const useGetActivities = () => {
  return useQuery<any, Error, UserActivity[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await fetch("/api/activities");
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json();
    },
  });
};
