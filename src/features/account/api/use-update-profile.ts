import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateProfileData {
  nickName?: string;
  bio?: string;
  avatar?: string;
  timezone?: string;
  interests?: string[];
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update profile");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });
};
