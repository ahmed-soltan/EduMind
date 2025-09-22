import { Permissions } from "@/db/types";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetAllPermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async (): Promise<Permissions[]> => {
      const res = await apiClient("/api/permissions", {
        withCredentials: true,
      });

      if (res.status !== 200) {
        throw new Error("Failed to fetch permissions");
      }

      return res.data.permissions;
    },
  });
};