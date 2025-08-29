import { useQuery } from "@tanstack/react-query";

export const useGetFlashCards = (deckId: string) => {
  return useQuery({
    queryKey: ["flashcards", deckId],
    queryFn: async () => {
      const response = await fetch(`/api/decks/${deckId}/flash-cards`);
      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }
      return response.json();
    },
  });
};
