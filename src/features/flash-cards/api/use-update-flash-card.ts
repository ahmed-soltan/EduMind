import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UpdateFlashCardSchema } from "../schemas";
import { useDeckId } from "@/features/decks/hooks/use-deck-id";

export const useUpdateFlashCard = (flashCardId: string) => {
  const deckId = useDeckId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof UpdateFlashCardSchema>) => {
      const response = await fetch(
        `/api/decks/${deckId}/flash-cards/${flashCardId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update deck");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", deckId] });
    },
  });
};
