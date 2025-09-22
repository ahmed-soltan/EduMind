import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query"

export const useGetFlashCards = () =>{
    return useQuery({
        queryKey: ['flash-cards'],
        queryFn: async () => {
            const response = await apiClient('/api/dashboard/flashcards');
            return response.data;
        }
    })
}