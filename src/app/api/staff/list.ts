import { prisma } from "@/generated/prisma/prisma";
import { cacheTag } from "next/cache";

export async function getStaffList() {
  "use cache";
  cacheTag("staff-list");

  return await prisma.staff.findMany({
    orderBy: { full_name: "asc" },
  });
}
