import { useMutation } from "@tanstack/react-query";
import z from "zod";
import { onboardingSchema } from "../types";
import apiClient from "@/lib/api";

export const useOnboard = () => {
  return useMutation({
    mutationFn: async (
      data: z.infer<typeof onboardingSchema>
    ): Promise<{
      message: string;
      subdomain: {
        subdomain: string;
      };
    }> => {
      const response = await apiClient("/api/onboarding", {
        method: "POST",
        data: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = (await response.data) as {
        message: string;
        subdomain: {
          subdomain: string;
        };
      };
      if (response.status !== 200) {
        throw new Error(result.message || "Failed to log in");
      }
      return result;
    },
  });
};
