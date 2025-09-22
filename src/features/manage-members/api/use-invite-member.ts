import apiClient from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface InviteMemberData {
  email: string;
  roleId: string;
}

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteMemberData) => {
      const res = await apiClient("/api/members/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      });

      if (res.status !== 200) {
        const error = await res.data;
        throw new Error(error || "Failed to invite member");
      }

      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch members list
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      toast.error(error.response.data.error);
    },
  });
};
