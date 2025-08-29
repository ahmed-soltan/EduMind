import z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string({
    message: "Password is required",
  }),
});

export const signupSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters long",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters long",
  }),
  email: z.email(),
  password: z
    .string()
    .min(6, {
      message: "Password is must be at least 6 characters long",
    })
    .max(100, {
      message: "Password is must be at most 100 characters long",
    }),
});
