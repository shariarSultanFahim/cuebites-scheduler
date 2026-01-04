import { z } from "zod";

export const scheduleCreateSchema = z.object({
  staffId: z.number().int().positive("Staff is required"),
  startTime: z.iso.datetime("Invalid start time"),
  endTime: z.iso.datetime("Invalid end time"),
  workAddress: z.string().min(1, "Work address is required"),
  shiftBonus: z.number().optional(),
  instructions: z.string().optional(),
});

export type CreateScheduleInput = z.infer<typeof scheduleCreateSchema>;

export const scheduleUpdateSchema = z.object({
  id: z.number().int().positive("Schedule ID is required"),
  startTime: z.iso.datetime("Invalid start time"),
  endTime: z.iso.datetime("Invalid end time"),
  workAddress: z.string().min(1, "Work address is required"),
  shiftBonus: z.number().optional(),
  instructions: z.string().optional(),
});

export type UpdateScheduleInput = z.infer<typeof scheduleUpdateSchema>;
