"use server";

import { prisma } from "@/generated/prisma/prisma";
import { CreateScheduleInput, scheduleCreateSchema } from "./schema";

export async function createSchedule(data: CreateScheduleInput) {
  const parseResult = scheduleCreateSchema.safeParse(data);

  if (!parseResult.success) {
    return {
      success: false,
      errors: parseResult.error,
      message: "Validation failed",
    };
  }

  const validatedData = parseResult.data;

  try {
    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);

    // Check for overlapping schedules for the same staff
    const overlappingSchedule = await prisma.schedule.findFirst({
      where: {
        staffId: validatedData.staffId,
        OR: [
          {
            // New schedule starts during existing schedule
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (overlappingSchedule) {
      return {
        success: false,
        message: `Schedule overlaps with existing schedule.`,
      };
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        staffId: validatedData.staffId,
        startTime: startTime,
        endTime: endTime,
        workAddress: validatedData.workAddress,
        shiftBonus: validatedData.shiftBonus,
        instruction: validatedData.instructions,
      },
      include: {
        staff: true,
      },
    });

    return { success: true, data: newSchedule };
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return {
      success: false,
      message: "Failed to create schedule. Please check your input.",
    };
  }
}
