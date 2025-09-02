import { useCurrentUser } from "@/hooks/use-current-user";
import { useQuery } from "@tanstack/react-query";

export const useGetStreakData = () => {

  return useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const response = await fetch(`/api/streak`);
      if (!response.ok) {
        throw new Error("Failed to fetch streak data");
      }
      return response.json();
    },
  });
};
