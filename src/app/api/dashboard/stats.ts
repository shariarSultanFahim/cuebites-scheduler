"use server";

import { prisma } from "@/generated/prisma/prisma";
import { connection } from "next/server";

export async function getDashboardStats() {
  await connection();
  try {
    const [totalStaff, totalSchedules, activeSchedules] = await Promise.all([
      prisma.staff.count(),
      prisma.schedule.count(),
      prisma.schedule.count({
        where: {
          startTime: { gte: new Date() },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalStaff,
        totalSchedules,
        activeSchedules,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard statistics",
    };
  }
}

export async function getTopStaffBySchedules() {
  await connection();
  try {
    const topStaff = await prisma.staff.findMany({
      select: {
        id: true,
        full_name: true,
        _count: {
          select: { schedules: true },
        },
      },
      orderBy: {
        schedules: {
          _count: "desc",
        },
      },
      take: 3,
    });

    // Calculate total hours for each staff member
    const staffWithHours = await Promise.all(
      topStaff.map(async (staff) => {
        const schedules = await prisma.schedule.findMany({
          where: { staffId: staff.id },
          select: {
            startTime: true,
            endTime: true,
          },
        });

        const totalHours = schedules.reduce((acc, schedule) => {
          const start = new Date(schedule.startTime).getTime();
          const end = new Date(schedule.endTime).getTime();
          const hours = (end - start) / (1000 * 60 * 60);
          return acc + hours;
        }, 0);

        return {
          id: staff.id,
          name: staff.full_name,
          scheduleCount: staff._count.schedules,
          totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
        };
      })
    );

    return {
      success: true,
      data: staffWithHours,
    };
  } catch (error) {
    console.error("Failed to fetch top staff:", error);
    return {
      success: false,
      message: "Failed to fetch top staff data",
    };
  }
}
