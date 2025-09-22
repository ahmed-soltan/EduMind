import apiClient from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateMemberData {
  roleId?: string;
  isActive?: boolean;
}

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: UpdateMemberData }) => {
      const res = await apiClient(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        data: JSON.stringify(data),
      });

      if (res.status !== 200) {
        const errorData = await res.data;
        throw new Error(errorData.error || "Failed to update member");
      }

      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member-details", variables.memberId] });
      toast.success("Member updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update member");
    },
  });
};
