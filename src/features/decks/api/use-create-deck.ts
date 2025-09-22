import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateDeckSchema } from "../schemas";
import { toast } from "sonner";
import apiClient from "@/lib/api";

export const useCreateDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateDeckSchema>) => {
      const response = await apiClient("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      queryClient.invalidateQueries({ queryKey: ["userActivities"] });
      queryClient.invalidateQueries({ queryKey: ["can-create", "decks"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });
};
