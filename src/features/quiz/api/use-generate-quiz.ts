import { toast } from "sonner";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import apiClient from "@/lib/api";

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
      const response = await apiClient("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ tell server it’s JSON
        },
        data: JSON.stringify(data), // ✅ convert to valid JSON string
      });

      if (response.status !== 200) {
        const errorBody = await response.data.catch(() => null);
        throw new Error(errorBody?.error || "Something went wrong");
      }

      return response.data;
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
