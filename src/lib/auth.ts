import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  dob: z.string().refine((date) => {
    const d = new Date(date);
    return d < new Date() && d > new Date("1900-01-01");
  }, { message: "Please enter a valid date of birth" }),
  monthlyIncome: z.number().min(0, { message: "Monthly income must be positive" }),
  monthlySavingGoal: z.number().min(0, { message: "Savings goal must be positive" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
