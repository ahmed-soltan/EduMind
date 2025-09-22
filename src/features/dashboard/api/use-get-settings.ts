import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await apiClient("/api/settings");
      return response.data;
    },
  });
};
