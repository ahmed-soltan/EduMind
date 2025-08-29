import { useQuery } from "@tanstack/react-query"

export const useGetQuizzes = () =>{
    return useQuery({
        queryKey: ['quizzes'],
        queryFn: async () => {
            const response = await fetch('/api/quizzes');
            if (!response.ok) {
                throw new Error('Failed to fetch quizzes');
            }
            return response.json();
        }
    })
}