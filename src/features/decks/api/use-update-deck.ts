import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UpdateDeckSchema } from "../schemas";
import { toast } from "sonner";
import apiClient from "@/lib/api";

export const useUpdateDeck = (deckId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof UpdateDeckSchema>) => {
      const response = await apiClient(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      });

      return response.data;
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
