import apiClient from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deckId: string) => {
      const response = await apiClient(`/api/decks/${deckId}`, {
        method: "DELETE",
      });
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
