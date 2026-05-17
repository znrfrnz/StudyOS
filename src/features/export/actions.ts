"use server";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { exportFileSummary, exportStudyPlan } from "@/lib/export/markdown";
import { exportSessionsToIcs } from "@/lib/export/ics";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function exportFileMarkdown(fileId: string) {
  const user = await getUser();

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
  const user = await getUser();

  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id },
    orderBy: { startsAt: "asc" },
    include: { subject: true, file: true },
  });

  return exportStudyPlan(sessions);
}

export async function exportStudyPlanIcs() {
  const user = await getUser();

  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id, status: "planned" },
    orderBy: { startsAt: "asc" },
    include: { subject: true },
  });

  return exportSessionsToIcs(sessions);
}
