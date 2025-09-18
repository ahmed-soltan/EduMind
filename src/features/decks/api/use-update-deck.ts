import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UpdateDeckSchema } from "../schemas";
import { toast } from "sonner";

export const useUpdateDeck = (deckId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof UpdateDeckSchema>) => {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update deck");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["userActivities"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });
};
