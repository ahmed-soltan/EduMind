import { useQuery } from "@tanstack/react-query";
import { useDocumentId } from "../hooks/use-document-id";
import apiClient from "@/lib/api";

export const useGetDocument = () => {
  const documentId = useDocumentId();
  return useQuery({
    queryKey: ["document"],
    queryFn: async () => {
      const res = await apiClient(`/api/documents/${documentId}`);
      return res.data;
    },
  });
};
