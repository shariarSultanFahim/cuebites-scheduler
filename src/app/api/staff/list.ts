import { Prisma } from "@/generated/prisma/client";
import { cacheTag } from "next/cache";

export async function getStaffList() {
  "use cache";
  cacheTag("staff-list");

  return await Prisma.staff.findMany({
    orderBy: { name: "asc" },
  });
}
