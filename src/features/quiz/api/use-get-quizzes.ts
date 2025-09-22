import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query"

export const useGetQuizzes = () =>{
    return useQuery({
        queryKey: ['quizzes'],
        queryFn: async () => {
            const response = await apiClient('/api/quizzes');
            if (response.status !== 200) {
                throw new Error('Failed to fetch quizzes');
            }
            return response.data;
        }
    })
}