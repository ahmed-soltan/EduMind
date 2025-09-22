import { useDeckId } from "@/features/decks/hooks/use-deck-id";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetFlashCard = (flashcardId: string) => {
  const deckId = useDeckId();
  return useQuery({
    queryKey: ["flashcard", flashcardId],
    enabled: !!flashcardId && !!deckId,
    queryFn: async () => {
      const response = await apiClient(
        `/api/decks/${deckId}/flash-cards/${flashcardId}`
      );
      return response.data;
    },
  });
};
