import apiClient from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await apiClient(`/api/members/${memberId}`, {
        method: "DELETE",
        withCredentials: true,
      });
      
    
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete member");
    },
  });
};
