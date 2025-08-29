import { useQuery } from "@tanstack/react-query";

export const useGetDeck = (deckId: string | null) => {
  return useQuery({
    queryKey: ["deck", deckId],
    enabled: !!deckId,
    queryFn: async () => {
      const response = await fetch(`/api/decks/${deckId}`);
      if (!response.ok) throw new Error("Failed to fetch deck");
      return response.json();
    },
  });
};
