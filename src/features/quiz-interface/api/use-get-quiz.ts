import { useQuery } from "@tanstack/react-query";

export const useGetQuiz = (quizId: string) => {
  return useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (!res.ok) throw new Error("Failed to fetch quiz");
      return res.json();
    },
  });
};
