import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetQuiz = (quizId: string) => {
  return useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const res = await apiClient(`/api/quizzes/${quizId}`);
      if (res.status !== 200) throw new Error("Failed to fetch quiz");
      return res.data;
    },
  });
};
