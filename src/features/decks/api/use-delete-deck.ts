import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deckId: string) => {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete deck");
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      queryClient.invalidateQueries({ queryKey: ["can-create", "decks"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    }
  });
};
