// hooks/useAddDocument.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UploadedFile = {
  title: string;
  url?: string;
  size?: number;
  type?: string;
  key?: string;
  file?: File | null;
  text?: string; // extracted text (optional)
};

export const useAddDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadedFile) => {
      if (data.file) {
        const formData = new FormData();
        formData.append("file", data.file);
        formData.append("title", data.title);
        if (data.url) formData.append("url", data.url);
        formData.append("size", String(data.size ?? data.file.size ?? 0));
        formData.append(
          "type",
          data.type ?? data.file.type ?? "application/octet-stream"
        );
        if (data.key) formData.append("key", data.key);

        // If we have extracted text on client, include it as well (multipart field)
        if (data.text) formData.append("text", data.text);

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload document (file).");
        const result = await response.json();
        return result.documentId;
      }

      // JSON body (no file)
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to upload document (json).");
      const result = await response.json();
      return result.documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};
