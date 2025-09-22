import apiClient from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateAccountData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAccountData) => {
      const res = await apiClient("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        data: JSON.stringify(data),
      });
      
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Account updated successfully");
    },
    onError: () => {
      toast.error("Failed to update account");
    },
  });
};
