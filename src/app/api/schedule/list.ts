"use server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/generated/prisma/prisma";

interface GetScheduleListOptions {
  startTime?: Date | string;
  endTime?: Date | string;
  staffId?: number;
}

export async function getScheduleList(options?: GetScheduleListOptions) {
  try {
    const where: Prisma.ScheduleWhereInput = {};

    // Filter by staffId if provided
    if (options?.staffId) {
      where.staffId = options.staffId;
    }

    // Filter by startTime if provided
    if (options?.startTime) {
      const startTimeDate = new Date(options.startTime);
      where.startTime = {
        gte: startTimeDate,
      };
    }

    // Filter by endTime if provided
    if (options?.endTime) {
      const endTimeDate = new Date(options.endTime);
      where.endTime = {
        lte: endTimeDate,
      };
    }

    // Combine startTime and endTime filters if both provided
    if (options?.startTime && options?.endTime) {
      where.AND = [
        { startTime: { gte: new Date(options.startTime) } },
        { endTime: { lte: new Date(options.endTime) } },
      ];
      delete where.startTime;
      delete where.endTime;
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        staff: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return schedules || [];
  } catch (error) {
    console.error("Error fetching schedule list:", error);
    return [];
  }
}
