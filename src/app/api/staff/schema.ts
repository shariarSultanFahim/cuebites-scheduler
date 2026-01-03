import { Gender, StaffStatus, StaffType } from "@/generated/prisma/enums";
import z from "zod";

export const staffSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().min(7, "Phone number must be at least 7 digits"),
  gender: z.enum(Gender),
  avatar: z.url().optional(),
  address: z.string().min(5, "Address is required"),
  nationality: z.string().length(2, "Nationality is required"),
  status: z.enum(StaffStatus).optional(),
  type: z.enum(StaffType).optional(),
});

export type CreateStaffInput = z.infer<typeof staffSchema>;
