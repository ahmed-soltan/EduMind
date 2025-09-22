import apiClient from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await apiClient("/api/users/me")
      if (response.status !== 200) throw new Error("Failed to fetch user")
      return response.data
    },
  })
}
