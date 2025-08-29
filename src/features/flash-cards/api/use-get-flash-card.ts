import { useDeckId } from "@/features/decks/hooks/use-deck-id";
import { useQuery } from "@tanstack/react-query";

export const useGetFlashCard = (flashcardId: string) => {
  const deckId = useDeckId();
  return useQuery({
    queryKey: ["flashcard", flashcardId],
    enabled: !!flashcardId && !!deckId,
    queryFn: async () => {
      const response = await fetch(
        `/api/decks/${deckId}/flash-cards/${flashcardId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }
      return response.json();
    },
  });
};
