import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query"

export const useGetDocuments = () =>{
    return useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            const response = await apiClient('/api/documents');
            return response.data;
        }
    })
}