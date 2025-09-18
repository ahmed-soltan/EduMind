import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quizId: string) => {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["can-create", "quizzes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    }
  });
};
