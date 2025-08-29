import z from "zod";

export const CreateFlashCardSchema = z.object({
  front: z.string().min(2).max(100),
  back: z.string().min(2).max(500),
});

export const UpdateFlashCardSchema = z.object({
  front: z.string().min(2).max(100),
  back: z.string().min(2).max(500),
});


export const CreateAIGeneratedFlashCardSchema = z.object({
  numFlashCards: z.array(z.number().min(1).max(5)),
});
