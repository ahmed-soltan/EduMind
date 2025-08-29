import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = {
    topic: string;
    prompt: string;
    difficulty: string;
    numQuestions: number;
}

export const useGenerateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data:RequestType) => {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ tell server it’s JSON
        },
        body: JSON.stringify(data), // ✅ convert to valid JSON string
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
};
