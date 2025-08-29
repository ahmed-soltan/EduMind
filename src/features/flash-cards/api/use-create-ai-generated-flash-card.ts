import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateAIGeneratedFlashCardSchema } from "../schemas";
import { useDeckId } from "@/features/decks/hooks/use-deck-id";

export const useCreateAIGeneratedFlashCard = () => {
  const deckId = useDeckId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { numFlashCards: number }) => {
      const response = await fetch(`/api/decks/${deckId}/flash-cards/ai`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to create flash card");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
    },
  });
};
