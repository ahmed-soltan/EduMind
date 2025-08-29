import z from "zod";

export const CreateDeckSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(500),
});

export const UpdateDeckSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(500),
});
