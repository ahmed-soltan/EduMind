import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetFlashCards = (deckId: string) => {
  return useQuery({
    queryKey: ["flashcards", deckId],
    queryFn: async () => {
      const response = await apiClient(`/api/decks/${deckId}/flash-cards`);
      return response.data;
    },
  });
};
