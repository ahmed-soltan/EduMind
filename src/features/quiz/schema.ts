import z from "zod";

export const generateQuizSchema = z.object({
  topic: z.string().min(2, {
    message: "Topic must be at least 2 characters long",
  }).max(100),
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters long",
  }).max(500),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  numQuestions: z.array(z.number().min(1).max(10)),
});
