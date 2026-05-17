"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  generateSchedule,
  type ScheduleInput,
} from "@/lib/planner/engine";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getTodaySessions() {
  const user = await getUser();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.studySession.findMany({
    where: {
      userId: user.id,
      startsAt: { gte: startOfDay, lte: endOfDay },
    },
    orderBy: { startsAt: "asc" },
    include: { subject: true, file: { include: { aiMeta: true } } },
  });
}

export async function getWeekSessions() {
  const user = await getUser();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return prisma.studySession.findMany({
    where: {
      userId: user.id,
      startsAt: { gte: startOfWeek, lt: endOfWeek },
    },
    orderBy: { startsAt: "asc" },
  });
}

export async function getUpcomingSessions(limit = 20) {
  const user = await getUser();

  const now = new Date();

  return prisma.studySession.findMany({
    where: {
      userId: user.id,
      startsAt: { gte: now },
      status: { in: ["planned", "missed"] },
    },
    orderBy: { startsAt: "asc" },
    take: limit,
    include: { subject: true, file: { include: { aiMeta: true } } },
  });
}

export async function getSessionsBySubject(subjectId: string) {
  const user = await getUser();

  return prisma.studySession.findMany({
    where: { subjectId, userId: user.id },
    orderBy: { startsAt: "asc" },
    include: { subject: true, file: { include: { aiMeta: true } } },
  });
}

export async function updateSessionStatus(
  sessionId: string,
  status: "completed" | "missed" | "skipped",
) {
  const user = await getUser();

  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, userId: user.id },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  await prisma.studySession.update({
    where: { id: sessionId },
    data: { status },
  });

  if (status === "missed") {
    await rescheduleMissedSessions();
  }

  revalidatePath("/sessions");
  revalidatePath("/dashboard");

  return { success: true as const };
}

export async function generateStudyPlan(subjectId?: string) {
  const user = await getUser();

  // Fetch inputs
  const [subjects, deadlines, blocks, files, weakTopics] = await Promise.all([
    prisma.subject.findMany({
      where: { userId: user.id, archived: false },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    }),
    prisma.deadline.findMany({
      where: { userId: user.id },
      orderBy: { dueAt: "asc" },
      include: { subject: true },
    }),
    prisma.availabilityBlock.findMany({
      where: { userId: user.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.file.findMany({
      where: {
        userId: user.id,
        processingStatus: "ready",
      },
      include: { aiMeta: true, subject: true },
    }),
    prisma.weakTopicSignal.findMany({
      where: { userId: user.id },
    }),
  ]);

  if (deadlines.length === 0) {
    throw new Error("Create at least one deadline before generating a plan.");
  }

  if (blocks.length === 0) {
    throw new Error(
      "Create at least one availability block before generating a plan.",
    );
  }

  // Filter to specific subject if provided
  const targetSubjects = subjectId
    ? subjects.filter((s) => s.id === subjectId)
    : subjects;

  const targetDeadlines = subjectId
    ? deadlines.filter((d) => d.subjectId === subjectId)
    : deadlines;

  const targetFiles = subjectId
    ? files.filter((f) => f.subjectId === subjectId)
    : files;

  if (targetSubjects.length === 0) {
    throw new Error("Subject not found.");
  }

  if (targetDeadlines.length === 0) {
    throw new Error("Create at least one deadline for this subject.");
  }

  const input: ScheduleInput = {
    userId: user.id,
    subjects: targetSubjects,
    deadlines: targetDeadlines,
    blocks,
    files: targetFiles,
    weakTopics,
  };

  const sessions = generateSchedule(input);

  // Delete existing planned sessions for the target scope
  const existingWhere = subjectId
    ? { userId: user.id, subjectId, status: "planned" }
    : { userId: user.id, status: "planned" };

  await prisma.studySession.deleteMany({ where: existingWhere });

  // Create new sessions
  await prisma.studySession.createMany({
    data: sessions.map((s) => ({
      userId: s.userId,
      subjectId: s.subjectId,
      fileId: s.fileId,
      topic: s.topic,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      durationMinutes: s.durationMinutes,
      sessionType: s.sessionType,
      status: "planned",
      goal: s.goal,
      reason: s.reason,
    })),
  });

  revalidatePath("/sessions");
  revalidatePath("/dashboard");
  revalidatePath("/plan");

  return { success: true as const, count: sessions.length };
}

export async function rescheduleMissedSessions() {
  const user = await getUser();

  const missed = await prisma.studySession.findMany({
    where: {
      userId: user.id,
      status: "missed",
    },
    include: { subject: true, file: true },
    orderBy: { startsAt: "asc" },
  });

  if (missed.length === 0) {
    return { success: true as const, count: 0 };
  }

  const blocks = await prisma.availabilityBlock.findMany({
    where: { userId: user.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  if (blocks.length === 0) {
    throw new Error("No availability blocks found.");
  }

  const now = new Date();

  let rescheduledCount = 0;

  for (const session of missed) {
    const subjectDeadline = await prisma.deadline.findFirst({
      where: {
        userId: user.id,
        subjectId: session.subjectId,
        dueAt: { gt: now },
      },
      orderBy: { dueAt: "asc" },
    });

    const searchEnd = subjectDeadline?.dueAt ?? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const candidate = new Date(now);
    candidate.setHours(0, 0, 0, 0);

    let foundSlot: { startsAt: Date; endsAt: Date } | null = null;

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const checkDate = new Date(candidate);
      checkDate.setDate(checkDate.getDate() + dayOffset);

      if (checkDate > searchEnd) break;

      const dayOfWeek = checkDate.getDay();

      const dayBlocks = blocks.filter((b) => b.dayOfWeek === dayOfWeek);

      for (const block of dayBlocks) {
        const [startH, startM] = block.startTime.split(":").map(Number);
        const slotStart = new Date(checkDate);
        slotStart.setHours(startH, startM, 0, 0);

        // Skip past slots for today
        if (slotStart < now) continue;

        const [endH, endM] = block.endTime.split(":").map(Number);
        const slotEnd = new Date(checkDate);
        slotEnd.setHours(endH, endM, 0, 0);

        const proposedEnd = new Date(
          slotStart.getTime() + session.durationMinutes * 60000,
        );

        if (proposedEnd > slotEnd || proposedEnd > searchEnd) continue;

        const conflict = await prisma.studySession.findFirst({
          where: {
            userId: user.id,
            NOT: { id: session.id },
            startsAt: { lt: proposedEnd },
            endsAt: { gt: slotStart },
          },
        });

        if (!conflict) {
          foundSlot = {
            startsAt: slotStart,
            endsAt: proposedEnd,
          };
          break;
        }
      }

      if (foundSlot) break;
    }

    if (foundSlot) {
      await prisma.studySession.update({
        where: { id: session.id },
        data: {
          status: "planned",
          startsAt: foundSlot.startsAt,
          endsAt: foundSlot.endsAt,
        },
      });
      rescheduledCount++;
    }
  }

  revalidatePath("/sessions");
  revalidatePath("/dashboard");

  return { success: true as const, count: rescheduledCount };
}
