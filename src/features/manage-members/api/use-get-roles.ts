import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async (): Promise<any[]> => {
      const res = await apiClient("/api/roles");
      if (res.status !== 200) throw new Error("Failed to fetch roles");
      return res.data;
    },
  });
};
