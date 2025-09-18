import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateDeckSchema } from "../schemas";
import { toast } from "sonner";

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
        const errorBody = await response.json().catch(() => null);
        if (errorBody?.error) {
          throw new Error(errorBody.error || "Something went wrong");
        }
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      queryClient.invalidateQueries({ queryKey: ["userActivities"] });
      queryClient.invalidateQueries({ queryKey: ["can-create", "decks"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    }
  });
};
