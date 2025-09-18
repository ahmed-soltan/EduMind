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
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update member");
      }
      
      return res.json();
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
