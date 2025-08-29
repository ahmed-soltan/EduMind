import z from "zod";

export const onboardingSchema = z.object({
  nickName: z.string().optional(),
  bio: z.string().max(500).optional(),
  subdomain: z.string().min(3, {
    message: "Subdomain must be at least 3 characters long",
  }).max(10, {
    message: "Subdomain must be at most 10 characters long",
  }).optional(),
  gradeLevel: z.string().optional(),
  interests: z.array(z.string()).optional(),
  learningGoal: z.string().optional(),
});
