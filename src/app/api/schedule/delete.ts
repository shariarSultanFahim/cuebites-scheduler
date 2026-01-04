"use server";

import { prisma } from "@/generated/prisma/prisma";
import { z } from "zod";

const deleteScheduleSchema = z.object({
  id: z.number().int().positive("Schedule ID is required"),
});

export async function deleteSchedule(data: unknown) {
  try {
    const validatedData = deleteScheduleSchema.parse(data);

    const schedule = await prisma.schedule.delete({
      where: {
        id: validatedData.id,
      },
    });

    return {
      success: true,
      data: schedule,
      message: "Schedule deleted successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: z.treeifyError(error),
        message: "Validation failed",
      };
    }

    console.error("Delete schedule error:", error);
    return {
      success: false,
      message: "Failed to delete schedule",
    };
  }
}
