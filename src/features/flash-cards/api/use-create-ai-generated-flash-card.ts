import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useDeckId } from "@/features/decks/hooks/use-deck-id";

export const useCreateAIGeneratedFlashCard = () => {
  const deckId = useDeckId();
  const queryClient = useQueryClient();
  const router = useRouter();
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
        const errorBody = await response.json().catch(() => null);
        if (errorBody?.error) {
          throw new Error(errorBody.error || "Something went wrong");
        }
      }
      return response.json();
    },
    onSuccess: () => {
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["userActivities"] });
      queryClient.invalidateQueries({ queryKey: ["can-create", "flashcards"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });
};
