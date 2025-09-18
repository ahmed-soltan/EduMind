import { Permissions } from "@/db/types";
import { useQuery } from "@tanstack/react-query";

export const useGetAllPermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async (): Promise<Permissions[]> => {
      const res = await fetch("/api/permissions", {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch permissions");
      }
      
      const data = await res.json();
      return data.permissions;
    },
  });
};