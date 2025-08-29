import { useMutation } from "@tanstack/react-query";

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Logout failed");
      }
    },
  });
};
