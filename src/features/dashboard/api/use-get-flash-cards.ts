import { useQuery } from "@tanstack/react-query"

export const useGetFlashCards = () =>{
    return useQuery({
        queryKey: ['flash-cards'],
        queryFn: async () => {
            const response = await fetch('/api/dashboard/flashcards');
            if (!response.ok) {
                throw new Error('Failed to fetch flash cards');
            }
            return response.json();
        }
    })
}