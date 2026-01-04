"use server";

import { prisma } from "@/generated/prisma/prisma";
import { z } from "zod";

const updateScheduleSchema = z.object({
  id: z.number().int().positive(),
  staffId: z.number().int().positive("Staff is required"),
  startTime: z.string().datetime("Invalid start time"),
  endTime: z.string().datetime("Invalid end time"),
  workAddress: z.string().min(1, "Work address is required"),
  shiftBonus: z.number().optional(),
  instruction: z.string().optional(),
});

export async function updateSchedule(data: unknown) {
  try {
    const validatedData = updateScheduleSchema.parse(data);

    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);

    // Check for overlapping schedules for the same staff (excluding the current schedule)
    const overlappingSchedule = await prisma.schedule.findFirst({
      where: {
        staffId: validatedData.staffId,
        id: {
          not: validatedData.id, // Exclude the current schedule
        },
        OR: [
          {
            // New schedule overlaps with existing schedule
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (overlappingSchedule) {
      return {
        success: false,
        message: `Schedule overlaps with existing schedule from ${overlappingSchedule.startTime.toISOString()} to ${overlappingSchedule.endTime.toISOString()}`,
      };
    }

    const schedule = await prisma.schedule.update({
      where: {
        id: validatedData.id,
      },
      data: {
        staffId: validatedData.staffId,
        startTime: startTime,
        endTime: endTime,
        workAddress: validatedData.workAddress,
        shiftBonus: validatedData.shiftBonus ?? null,
        instruction: validatedData.instruction ?? null,
      },
    });

    return {
      success: true,
      data: schedule,
      message: "Schedule updated successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: z.treeifyError(error),
        message: "Validation failed",
      };
    }

    console.error("Update schedule error:", error);
    return {
      success: false,
      message: "Failed to update schedule",
    };
  }
}
