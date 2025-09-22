import apiClient from "@/lib/api";
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
      const response = await apiClient(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (response.status !== 200) {
        throw new Error("Failed to delete quiz");
      }

      const result = await response.data;
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
