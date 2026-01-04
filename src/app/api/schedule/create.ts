"use server";

import { prisma } from "@/generated/prisma/prisma";
import { CreateScheduleInput, scheduleCreateSchema } from "./schema";

export async function createSchedule(data: CreateScheduleInput) {
  const parseResult = scheduleCreateSchema.safeParse(data);

  if (!parseResult.success) {
    return {
      success: false,
      errors: parseResult.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  const validatedData = parseResult.data;

  try {
    const newSchedule = await prisma.schedule.create({
      data: {
        staffId: validatedData.staffId,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
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
