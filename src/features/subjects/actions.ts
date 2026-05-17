"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";

const subjectSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().max(50).optional(),
  icon: z.string().max(50).optional(),
  priority: z.coerce.number().int().min(0).max(10).optional(),
});

export async function getSubjects() {
  const user = await requireUser();

  return prisma.subject.findMany({
    where: { userId: user.id, archived: false },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { files: true },
      },
    },
  });
}

export async function getSubject(id: string) {
  const user = await requireUser();

  return prisma.subject.findFirst({
    where: { id, userId: user.id },
  });
}

export async function createSubject(formData: FormData) {
  const user = await requireUser();

  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
    priority: formData.get("priority") || 0,
  });

  if (!parsed.success) {
    redirect("/subjects/new?error=invalid_input");
  }

  await prisma.subject.create({
    data: {
      ...parsed.data,
      userId: user.id,
    },
  });

  revalidatePath("/subjects");
  revalidatePath("/dashboard");
  redirect("/subjects");
}

export async function createSubjectFromPlan(formData: FormData) {
  const user = await requireUser();

  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
    priority: formData.get("priority") || 0,
  });

  if (!parsed.success) {
    redirect("/plan?error=invalid_subject");
  }

  await prisma.subject.create({
    data: {
      ...parsed.data,
      userId: user.id,
    },
  });

  revalidatePath("/subjects");
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  redirect("/plan");
}

export async function updateSubject(id: string, formData: FormData) {
  const user = await requireUser();

  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
    priority: formData.get("priority") || 0,
  });

  if (!parsed.success) {
    redirect(`/subjects/${id}?error=invalid_input`);
  }

  const existing = await prisma.subject.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    redirect("/subjects?error=not_found");
  }

  await prisma.subject.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/subjects");
  revalidatePath("/dashboard");
  revalidatePath(`/subjects/${id}`);
  redirect("/subjects");
}

export async function deleteSubject(id: string) {
  const user = await requireUser();

  const existing = await prisma.subject.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    redirect("/subjects?error=not_found");
  }

  await prisma.subject.delete({
    where: { id },
  });

  revalidatePath("/subjects");
  revalidatePath("/dashboard");
  redirect("/subjects");
}
