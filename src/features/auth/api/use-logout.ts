import apiClient from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient("/api/auth/logout", {
        method: "POST",
        withCredentials: true,
      });
    },
  });
};
