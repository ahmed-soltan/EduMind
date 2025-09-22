import z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useDeckId } from "@/features/decks/hooks/use-deck-id";
import { CreateFlashCardSchema } from "../schemas";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

export const useCreateFlashCard = () => {
  const deckId = useDeckId();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateFlashCardSchema>) => {
      const response = await apiClient(`/api/decks/${deckId}/flash-cards`, {
        method: "POST",
        data: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status !== 200) {
        const errorBody = await response.data.error;
        if (errorBody?.error) {
          throw new Error(errorBody.error || "Something went wrong");
        }
      }
      return response.data
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
    }
  });
};
