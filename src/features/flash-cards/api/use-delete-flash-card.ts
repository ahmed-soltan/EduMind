import { useDeckId } from "@/features/decks/hooks/use-deck-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useDeleteFlashCard = () => {
  const deckId = useDeckId();
  const queryClient = useQueryClient();
  const router = useRouter();

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
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["flashcards", deckId] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["userActivities"] });
      queryClient.invalidateQueries({ queryKey: ["can-create", "flashcards"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    }
  });
};
