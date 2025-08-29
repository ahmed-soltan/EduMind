import { useMutation, useQueryClient } from "@tanstack/react-query"
import z from "zod";
import { UpdateDeckSchema } from "../schemas";

export const useUpdateDeck = (deckId:string) =>{
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
        },
    })
}