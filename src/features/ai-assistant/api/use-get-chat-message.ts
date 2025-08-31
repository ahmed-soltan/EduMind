import { useQuery } from "@tanstack/react-query";
import { useDocumentId } from "../hooks/use-document-id";

export const useGetChatMessage = () => {
  const documentId = useDocumentId();

  return useQuery({
    queryKey: ["chatMessage", documentId],
    queryFn: async () => {
      if (!documentId) throw new Error("Document ID is required");
      const response = await fetch(`/api/documents/${documentId}/chat`);
      if (!response.ok) throw new Error("Failed to fetch chat messages");
      return response.json();
    },
  });
};
