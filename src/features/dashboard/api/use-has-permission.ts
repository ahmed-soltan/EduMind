import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useHasPermission = (permission: string) => {
  const router = useRouter();
  return useQuery({
    queryKey: ["hasPermission", permission],
    queryFn: async () => {
      const response = await fetch(
        `/api/permissions/has?permission=${permission}`
      );
      if (!response.ok) {
        const error = await response.json();
        console.log(error)
        if (error.error === "Not a member of tenant") {
          router.push("/");
        }
      }
      const data = await response.json();
      return data.hasPermission;
    },
  });
};
