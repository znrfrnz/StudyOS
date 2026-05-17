"use server";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/user";
import { exportFileSummary, exportStudyPlan } from "@/lib/export/markdown";
import { exportSessionsToIcs } from "@/lib/export/ics";

export async function exportFileMarkdown(fileId: string) {
  const user = await requireUser();

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId: user.id },
    include: { subject: true, aiMeta: true },
  });

  if (!file) {
    throw new Error("File not found");
  }

  return exportFileSummary(file);
}

export async function exportStudyPlanMarkdown() {
  const user = await requireUser();

  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id },
    orderBy: { startsAt: "asc" },
    include: { subject: true, file: true },
  });

  return exportStudyPlan(sessions);
}

export async function exportStudyPlanIcs() {
  const user = await requireUser();

  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id, status: "planned" },
    orderBy: { startsAt: "asc" },
    include: { subject: true },
  });

  return exportSessionsToIcs(sessions);
}
