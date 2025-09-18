import { useQuery } from "@tanstack/react-query";

export const useGetRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async (): Promise<any[]> => {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json();
    },
  });
};
