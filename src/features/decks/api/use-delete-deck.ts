import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    },
  });
};
