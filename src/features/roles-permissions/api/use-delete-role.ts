import apiClient from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const res = await apiClient(`/api/roles/${roleId}`, {
        method: "DELETE",
        withCredentials: true,
      });

      if (res.status !== 200) {
        const error = await res.data;
        throw new Error(error.error || "Failed to delete role");
      }

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
};
