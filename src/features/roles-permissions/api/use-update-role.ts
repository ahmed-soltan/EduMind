import apiClient from "@/lib/api";
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
      const res = await apiClient(`/api/roles/${roleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        data: JSON.stringify(data),
      });

      if (res.status !== 200) {
        const error = await res.data
        throw new Error(error.message || "Failed to update role");
      }

      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role-details"] });
    },
  });
};