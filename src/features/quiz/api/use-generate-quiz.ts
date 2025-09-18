import { toast } from "sonner";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type RequestType = {
  topic: string;
  prompt: string;
  difficulty: string;
  numQuestions: number;
};

export const useGenerateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RequestType) => {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ tell server it’s JSON
        },
        body: JSON.stringify(data), // ✅ convert to valid JSON string
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || "Something went wrong");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["userActivities"] });
      queryClient.invalidateQueries({ queryKey: ["can-create", "quizzes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });
};
