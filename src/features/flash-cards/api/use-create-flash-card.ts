import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useDeckId } from "@/features/decks/hooks/use-deck-id";
import { CreateFlashCardSchema } from "../schemas";

export const useCreateFlashCard = () => {
  const deckId = useDeckId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateFlashCardSchema>) => {
      const response = await fetch(`/api/decks/${deckId}/flash-cards`, {
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
