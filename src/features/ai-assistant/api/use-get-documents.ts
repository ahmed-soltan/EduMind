import { useQuery } from "@tanstack/react-query"

export const useGetDocuments = () =>{
    return useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            const response = await fetch('/api/documents');
            if (!response.ok) {
                throw new Error('Failed to fetch documents');
            }
            return response.json();
        }
    })
}