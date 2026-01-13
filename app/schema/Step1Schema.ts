import { z } from "zod";

export const Step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  state: z.string().min(1, "State is required"),
  branch: z.string().min(1, "Branch is required"),
});

export type Step1FormData = z.infer<typeof Step1Schema>;
