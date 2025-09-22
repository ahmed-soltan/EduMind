import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetDeck = (deckId: string | null) => {
  return useQuery({
    queryKey: ["deck", deckId],
    enabled: !!deckId,
    queryFn: async () => {
      const response = await apiClient(`/api/decks/${deckId}`);
      return response.data;
    },
  });
};
