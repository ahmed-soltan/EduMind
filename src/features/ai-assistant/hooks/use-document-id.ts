import { useParams } from "next/navigation";

export const useDocumentId = () => {
  const params = useParams();
  return params.documentId as string;
};
