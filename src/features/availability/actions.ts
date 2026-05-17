"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";

const availabilitySchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxSessionMinutes: z.coerce.number().int().min(15).max(480).optional(),
});

export async function getAvailabilityBlocks() {
  const user = await requireUser();

  return prisma.availabilityBlock.findMany({
    where: { userId: user.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function createAvailabilityBlock(formData: FormData) {
  const user = await requireUser();

  const parsed = availabilitySchema.safeParse({
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    maxSessionMinutes: formData.get("maxSessionMinutes") || 90,
  });

  if (!parsed.success) {
    redirect("/availability?error=invalid_input");
  }

  const { startTime, endTime, maxSessionMinutes, dayOfWeek } = parsed.data;

  if (startTime >= endTime) {
    redirect("/availability?error=invalid_time");
  }

  await prisma.availabilityBlock.create({
    data: {
      userId: user.id,
      dayOfWeek,
      startTime,
      endTime,
      maxSessionMinutes: maxSessionMinutes ?? 90,
    },
  });

  revalidatePath("/availability");
  revalidatePath("/dashboard");
  redirect("/availability");
}

export async function createAvailabilityBlockFromPlan(formData: FormData) {
  const user = await requireUser();

  const parsed = availabilitySchema.safeParse({
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    maxSessionMinutes: formData.get("maxSessionMinutes") || 90,
  });

  if (!parsed.success) {
    redirect("/plan?error=invalid_availability");
  }

  const { startTime, endTime, maxSessionMinutes, dayOfWeek } = parsed.data;

  if (startTime >= endTime) {
    redirect("/plan?error=invalid_availability_time");
  }

  await prisma.availabilityBlock.create({
    data: {
      userId: user.id,
      dayOfWeek,
      startTime,
      endTime,
      maxSessionMinutes: maxSessionMinutes ?? 90,
    },
  });

  revalidatePath("/availability");
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  redirect("/plan");
}

export async function deleteAvailabilityBlock(id: string) {
  const user = await requireUser();

  const existing = await prisma.availabilityBlock.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Availability block not found");
  }

  await prisma.availabilityBlock.delete({ where: { id } });

  revalidatePath("/availability");
  revalidatePath("/dashboard");

  return { success: true as const };
}
