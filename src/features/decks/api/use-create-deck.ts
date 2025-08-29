import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateDeckSchema } from "../schemas";

export const useCreateDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateDeckSchema>) => {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create deck");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};
