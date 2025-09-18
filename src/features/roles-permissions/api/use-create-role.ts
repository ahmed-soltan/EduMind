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
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create role");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
