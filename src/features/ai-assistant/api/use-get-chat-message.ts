import { useQuery } from "@tanstack/react-query";
import { useDocumentId } from "../hooks/use-document-id";
import apiClient from "@/lib/api";

export const useGetChatMessage = () => {
  const documentId = useDocumentId();

  return useQuery({
    queryKey: ["chatMessage", documentId],
    queryFn: async () => {
      if (!documentId) throw new Error("Document ID is required");
      const response = await apiClient(`/api/documents/${documentId}/chat`);
      return response.data;
    },
  });
};
