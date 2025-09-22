import apiClient from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useQuizAttempt = (quizId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient(
        `/api/quizzes/${quizId}/quiz-attempts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(data),
        }
      );
      if (response.status !== 200) {
        throw new Error("Failed to submit quiz attempt");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["userActivities"] });
    },
  });
};
