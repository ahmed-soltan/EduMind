import { useQuery } from "@tanstack/react-query";

export const useCurrentMember = () => {
  return useQuery({
    queryKey: ["currentMember"],
    queryFn: async () => {
      const response = await fetch("/api/members/current-member");
      if (!response.ok) {
        throw new Error("Failed to fetch current member");
      }
      return response.json();
    },
  });
};
