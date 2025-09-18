import { useQuery } from "@tanstack/react-query";

export const useGetMembers = () => {
  return useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await fetch("/api/members");
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });
};
