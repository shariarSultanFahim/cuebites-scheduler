"use server";

import { prisma } from "@/generated/prisma/prisma";
import { staffSchema } from "./schema";

export async function createStaff(formData: FormData) {
  const rawData = Object.fromEntries(formData);

  // console.log("Raw Data:", rawData);

  if (rawData.avatar === "") {
    delete rawData.avatar;
  }

  const parseResult = staffSchema.safeParse(rawData);

  if (!parseResult.success) {
    return {
      success: false,
      errors: parseResult.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  const data = parseResult.data;

  try {
    const newStaff = await prisma.staff.create({ data });

    return { success: true, data: newStaff };
  } catch (error) {
    console.error("Failed to create staff:", error);
    return {
      success: false,
      message: "Failed to create staff. Email or Phone might already exist.",
    };
  }
}
