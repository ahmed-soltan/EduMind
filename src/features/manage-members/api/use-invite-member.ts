import { useMutation, useQueryClient } from "@tanstack/react-query";

interface InviteMemberData {
  email: string;
  roleId: string;
}

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteMemberData) => {
      const res = await fetch("/api/members/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to invite member");
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch members list
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
};
