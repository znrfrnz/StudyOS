import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";

const subjectInclude = {
  _count: {
    select: { files: true },
  },
} as const;

function getTodayRange() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

export async function getDashboardData() {
  const user = await requireUser();
  const { startOfDay, endOfDay } = getTodayRange();

  const [subjects, todaySessions, deadlines, recentFiles] = await prisma.$transaction([
    prisma.subject.findMany({
      where: { userId: user.id, archived: false },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: subjectInclude,
    }),
    prisma.studySession.findMany({
      where: {
        userId: user.id,
        startsAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startsAt: "asc" },
      include: { subject: true, file: { include: { aiMeta: true } } },
    }),
    prisma.deadline.findMany({
      where: { userId: user.id },
      orderBy: { dueAt: "asc" },
      include: { subject: true },
    }),
    prisma.file.findMany({
      where: { userId: user.id },
      orderBy: { uploadedAt: "desc" },
      take: 5,
      include: { subject: true, aiMeta: true },
    }),
  ]);

  return { subjects, todaySessions, deadlines, recentFiles };
}

export async function getPlanPageData() {
  const user = await requireUser();

  const [subjects, deadlines, blocks] = await prisma.$transaction([
    prisma.subject.findMany({
      where: { userId: user.id, archived: false },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: subjectInclude,
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
  ]);

  return { subjects, deadlines, blocks };
}

export async function getDeadlinesPageData() {
  const user = await requireUser();

  const [deadlines, subjects] = await prisma.$transaction([
    prisma.deadline.findMany({
      where: { userId: user.id },
      orderBy: { dueAt: "asc" },
      include: { subject: true },
    }),
    prisma.subject.findMany({
      where: { userId: user.id, archived: false },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: subjectInclude,
    }),
  ]);

  return { deadlines, subjects };
}

export async function getSessionsPageData() {
  const user = await requireUser();
  const { startOfDay, endOfDay } = getTodayRange();
  const now = new Date();

  const [today, upcoming] = await prisma.$transaction([
    prisma.studySession.findMany({
      where: {
        userId: user.id,
        startsAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startsAt: "asc" },
      include: { subject: true, file: { include: { aiMeta: true } } },
    }),
    prisma.studySession.findMany({
      where: {
        userId: user.id,
        startsAt: { gte: now },
        status: { in: ["planned", "missed"] },
      },
      orderBy: { startsAt: "asc" },
      take: 20,
      include: { subject: true, file: { include: { aiMeta: true } } },
    }),
  ]);

  return { today, upcoming };
}

export async function getPracticePageData() {
  const user = await requireUser();

  const [subjects, files, quizzes, flashcards] = await prisma.$transaction([
    prisma.subject.findMany({
      where: { userId: user.id, archived: false },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: subjectInclude,
    }),
    prisma.file.findMany({
      where: {
        userId: user.id,
        processingStatus: "ready",
      },
      orderBy: [{ subject: { name: "asc" } }, { uploadedAt: "desc" }],
      include: { subject: true, aiMeta: true },
    }),
    prisma.quiz.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        subject: true,
        file: true,
        questions: true,
        attempts: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.flashcard.findMany({
      where: { userId: user.id },
      orderBy: [{ masteryLevel: "asc" }, { lastReviewedAt: "asc" }],
      include: { subject: true },
    }),
  ]);

  return { subjects, files, quizzes, flashcards };
}
