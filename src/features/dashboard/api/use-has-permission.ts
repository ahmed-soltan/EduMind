import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

export const useHasPermission = (permission: string) => {
  const router = useRouter();

  return useQuery<boolean, AxiosError>({
    queryKey: ["hasPermission", permission],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ hasPermission: boolean }>(
          `/api/permissions/has?permission=${permission}`
        );
        return response.data.hasPermission;
      } catch (err) {
        const error = err as AxiosError<{ error?: string }>;

        if (error.response?.data?.error === "Not a member of tenant") {
          router.push("/");
        }

        throw error;
      }
    },
  });
};
