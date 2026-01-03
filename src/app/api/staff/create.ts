"use server";

import { Prisma } from "@/generated/prisma/client";
import { revalidateTag, updateTag } from "next/cache";
import { staffSchema } from "./schema";

export async function createStaff(formData: FormData) {
  const data = staffSchema.parse(Object.fromEntries(formData));

  const newStaff = await Prisma.staff.create({ data });

  // Next 16: Immediately expires the tag and refetches for the current route
  updateTag("staff-list");
  revalidateTag("staff-list", "max");

  return { success: true, data: newStaff };
}
