import { useDeckId } from "@/features/decks/hooks/use-deck-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteFlashCard = () => {
  const deckId = useDeckId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flashCardId: string) => {
      const response = await fetch(
        `/api/decks/${deckId}/flash-cards/${flashCardId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", deckId] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
    },
  });
};
