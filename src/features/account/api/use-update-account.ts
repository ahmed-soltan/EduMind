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
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update account");
      }
      
      return res.json();
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
