import { useQuery } from "@tanstack/react-query";
import { useDocumentId } from "../hooks/use-document-id";

export const useGetDocument = () => {
  const documentId = useDocumentId();
  return useQuery({
    queryKey: ["document"],
    queryFn: async () => {
      const res = await fetch(`/api/documents/${documentId}`);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });
};
