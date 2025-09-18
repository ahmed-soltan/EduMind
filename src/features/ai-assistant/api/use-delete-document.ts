import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete document");
      }
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
