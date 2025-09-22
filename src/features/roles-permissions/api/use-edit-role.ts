import apiClient from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateRoleData {
  roleName: string;
  description?: string;
  permissions: string[];
}

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleData) => {
      const res = await apiClient("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        data: JSON.stringify(data),
      });

      if (res.status !== 200) {
        const error = await res.data;
        throw new Error(error.message || "Failed to create role");
      }

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};