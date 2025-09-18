import { useQuery } from "@tanstack/react-query";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ensure cookies are sent
      });
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      return res.json();
    },
  });
};
