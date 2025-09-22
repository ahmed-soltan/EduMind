import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await apiClient.get("/api/profile", {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return res.data; // axios puts JSON response in res.data
    },
  });
};
