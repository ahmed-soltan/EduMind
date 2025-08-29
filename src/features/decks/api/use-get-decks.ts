import { useQuery } from "@tanstack/react-query";

export const useGetDecks = () => {
  return useQuery({
    queryKey: ["decks"],
    queryFn: async () => {
      const response = await fetch("/api/decks");
      return response.json();
    },
  });
};
