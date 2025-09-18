import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useQuizAttempt = (quizId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(
        `/api/quizzes/${quizId}/quiz-attempts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to submit quiz attempt");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["userActivities"] });
    },
  });
};
