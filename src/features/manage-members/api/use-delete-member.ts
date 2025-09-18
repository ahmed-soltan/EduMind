import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete member");
      }
      
      return res.json();
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
