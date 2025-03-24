import { z } from "zod";

export const SignupSchema = z
  .object({
    firstname: z.string().min(3, "Name must be at least 3 characters"),
    surname: z.string().min(2, "Surname must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Intern", "Admin"], { message: "Role must be 'Intern' or 'Admin'" }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type SignupData = z.infer<typeof SignupSchema>;
