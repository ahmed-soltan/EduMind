import { useQuery } from "@tanstack/react-query"

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/users/me")
      if (!response.ok) throw new Error("Failed to fetch user")
      return response.json()
    },
  })
}
