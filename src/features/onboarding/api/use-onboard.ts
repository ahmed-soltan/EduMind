import { useMutation } from "@tanstack/react-query";
import z from "zod";
import { onboardingSchema } from "../types";

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
      const response = await fetch("/api/onboarding", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = (await response.json()) as {
        message: string;
        subdomain: {
          subdomain: string;
        };
      };
      if (!response.ok) {
        throw new Error(result.message || "Failed to log in");
      }
      return result;
    },
  });
};
