"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

const deadlineSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(1).max(200),
  dueAt: z.string().min(1),
  priority: z.coerce.number().int().min(0).max(10).optional(),
});

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getDeadlines() {
  const user = await getUser();

  return prisma.deadline.findMany({
    where: { userId: user.id },
    orderBy: { dueAt: "asc" },
    include: { subject: true },
  });
}

export async function getDeadlinesBySubject(subjectId: string) {
  const user = await getUser();

  return prisma.deadline.findMany({
    where: { subjectId, userId: user.id },
    orderBy: { dueAt: "asc" },
    include: { subject: true },
  });
}

export async function createDeadline(formData: FormData) {
  const user = await getUser();

  const parsed = deadlineSchema.safeParse({
    subjectId: formData.get("subjectId"),
    title: formData.get("title"),
    dueAt: formData.get("dueAt"),
    priority: formData.get("priority") || 0,
  });

  if (!parsed.success) {
    redirect("/deadlines/new?error=invalid_input");
  }

  const dueAt = new Date(parsed.data.dueAt);
  if (isNaN(dueAt.getTime())) {
    redirect("/deadlines/new?error=invalid_date");
  }

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, userId: user.id },
  });

  if (!subject) {
    redirect("/deadlines/new?error=subject_not_found");
  }

  await prisma.deadline.create({
    data: {
      userId: user.id,
      subjectId: parsed.data.subjectId,
      title: parsed.data.title,
      dueAt,
      priority: parsed.data.priority ?? 0,
    },
  });

  revalidatePath("/deadlines");
  revalidatePath("/dashboard");
  redirect("/deadlines");
}

export async function createDeadlineFromPlan(formData: FormData) {
  const user = await getUser();

  const parsed = deadlineSchema.safeParse({
    subjectId: formData.get("subjectId"),
    title: formData.get("title"),
    dueAt: formData.get("dueAt"),
    priority: formData.get("priority") || 0,
  });

  if (!parsed.success) {
    redirect("/plan?error=invalid_deadline");
  }

  const dueAt = new Date(parsed.data.dueAt);
  if (isNaN(dueAt.getTime())) {
    redirect("/plan?error=invalid_deadline_date");
  }

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, userId: user.id },
  });

  if (!subject) {
    redirect("/plan?error=subject_not_found");
  }

  await prisma.deadline.create({
    data: {
      userId: user.id,
      subjectId: parsed.data.subjectId,
      title: parsed.data.title,
      dueAt,
      priority: parsed.data.priority ?? 0,
    },
  });

  revalidatePath("/deadlines");
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  redirect("/plan");
}

export async function createDeadlineFromDeadlines(formData: FormData) {
  const user = await getUser();

  const parsed = deadlineSchema.safeParse({
    subjectId: formData.get("subjectId"),
    title: formData.get("title"),
    dueAt: formData.get("dueAt"),
    priority: formData.get("priority") || 0,
  });

  if (!parsed.success) {
    redirect("/deadlines?error=invalid_deadline");
  }

  const dueAt = new Date(parsed.data.dueAt);
  if (isNaN(dueAt.getTime())) {
    redirect("/deadlines?error=invalid_deadline_date");
  }

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, userId: user.id },
  });

  if (!subject) {
    redirect("/deadlines?error=subject_not_found");
  }

  await prisma.deadline.create({
    data: {
      userId: user.id,
      subjectId: parsed.data.subjectId,
      title: parsed.data.title,
      dueAt,
      priority: parsed.data.priority ?? 0,
    },
  });

  revalidatePath("/deadlines");
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  redirect("/deadlines");
}

export async function deleteDeadline(id: string) {
  const user = await getUser();

  const existing = await prisma.deadline.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Deadline not found");
  }

  await prisma.deadline.delete({ where: { id } });

  revalidatePath("/deadlines");
  revalidatePath("/dashboard");

  return { success: true as const };
}
