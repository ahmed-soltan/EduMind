import apiClient from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (data: { documentId: string; message: string }) => {
      const response = await apiClient("/api/documents/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      });
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });
};
