import apiClient from "@/lib/api";
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
      const res = await apiClient("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        data: JSON.stringify(data),
      });

      return res.data;
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
