import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UpdateFlashCardSchema } from "../schemas";
import { useDeckId } from "@/features/decks/hooks/use-deck-id";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/lib/api";

export const useUpdateFlashCard = (flashCardId: string) => {
  const deckId = useDeckId();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: z.infer<typeof UpdateFlashCardSchema>) => {
      const response = await apiClient(
        `/api/decks/${deckId}/flash-cards/${flashCardId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(data),
        }
      );

      return response.data;
    },
    onSuccess: () => {
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["userActivities"] });
      queryClient.invalidateQueries({ queryKey: ["flashcards", deckId] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    }
  });
};
