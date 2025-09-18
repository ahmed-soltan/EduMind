import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateRoleData {
  roleId: string;
  roleName: string;
  description?: string;
  permissions: string[];
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, ...data }: UpdateRoleData) => {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update role");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role-details"] });
    },
  });
};