"use server";
import { StaffStatus } from "@/generated/prisma/enums";
import { prisma } from "@/generated/prisma/prisma";

export async function getStaffList(searchQuery?: string, status?: StaffStatus) {
  try {
    const staffList = await prisma.staff.findMany({
      where: {
        OR: [
          {
            full_name: { contains: searchQuery || "" },
          },
          { email: { contains: searchQuery || "" } },
          { phone: { contains: searchQuery || "" } },
        ],
        AND: status ? [{ status: status }] : [],
      },
    });

    return staffList || [];
  } catch (error) {
    console.error("Error fetching staff list:", error);
    return [];
  }
}
