import { QueryClient, useMutation } from "@tanstack/react-query";
import { UploadedFile } from "../components/add-document-form";

export const useAddDocument = () => {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: async (data: UploadedFile) => {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ tell server it’s JSON
        },
        body: JSON.stringify(data), // ✅ convert to valid JSON string
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const result = await response.json();
      return result.documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};
