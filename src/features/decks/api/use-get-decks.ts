import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetDecks = () => {
  return useQuery({
    queryKey: ["decks"],
    queryFn: async () => {
      const response = await apiClient("/api/decks");
      return response.data;
    },
  });
};
