// hooks/useAddDocument.ts
import apiClient from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

        const response = await apiClient("/api/documents/upload", {
          method: "POST",
          data: formData,
        });

        return response.data.documentId;
      }

      // JSON body (no file)
      const response = await apiClient("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify(data),
      });

      const result = response.data;
      return result.documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["can-create", "documents"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    }
  });
};
