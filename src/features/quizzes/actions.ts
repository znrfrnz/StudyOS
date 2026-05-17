"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { generateQuizQuestions } from "@/lib/ai/openai";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getQuizzes() {
  const user = await getUser();

  return prisma.quiz.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
      file: true,
      questions: true,
      attempts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export async function getQuizzesBySubject(subjectId: string) {
  const user = await getUser();

  return prisma.quiz.findMany({
    where: { subjectId, userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
      file: true,
      questions: true,
      attempts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export async function getQuiz(quizId: string) {
  const user = await getUser();

  return prisma.quiz.findFirst({
    where: { id: quizId, userId: user.id },
    include: {
      subject: true,
      file: true,
      questions: { orderBy: { id: "asc" } },
    },
  });
}

export async function generateQuiz(
  fileId: string,
  options: { fresh?: boolean; titlePrefix?: string } = {},
) {
  const user = await getUser();

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId: user.id },
    include: { aiMeta: true, subject: true, chunks: true },
  });

  if (!file) {
    throw new Error("File not found");
  }

  if (file.processingStatus !== "ready" || !file.aiMeta) {
    throw new Error("File is not ready for quiz generation");
  }

  if (!options.fresh) {
    const existingQuiz = await prisma.quiz.findFirst({
      where: { fileId: file.id, userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (existingQuiz) {
      return { success: true as const, quizId: existingQuiz.id };
    }
  }

  // Combine chunks for quiz generation
  const textContent = file.chunks.map((c) => c.content).join("\n\n");
  const topics = file.aiMeta.topics.length > 0 ? file.aiMeta.topics : [file.name];

  const questions = await generateQuizQuestions(textContent, topics, 5);

  if (questions.length === 0) {
    throw new Error("Could not generate quiz questions from this file");
  }

  const quiz = await prisma.quiz.create({
    data: {
      userId: user.id,
      subjectId: file.subjectId,
      fileId: file.id,
      title: `${options.titlePrefix || "Quiz"}: ${file.name}`,
      questions: {
        create: questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          sourceExcerpt: q.sourceExcerpt,
          topic: q.topic,
        })),
      },
    },
    include: { questions: true },
  });

  revalidatePath(`/files/${fileId}`);
  revalidatePath(`/subjects/${file.subjectId}`);
  revalidatePath(`/quizzes`);
  revalidatePath(`/practice`);

  return { success: true as const, quizId: quiz.id };
}

export async function generateQuizzesForFiles(formData: FormData) {
  const fileIds = formData
    .getAll("fileIds")
    .map((id) => id.toString())
    .filter(Boolean);

  if (fileIds.length === 0) {
    throw new Error("Select at least one file.");
  }

  const quizIds: string[] = [];

  for (const fileId of fileIds) {
    const result = await generateQuiz(fileId);
    quizIds.push(result.quizId);
  }

  revalidatePath("/practice");
  revalidatePath("/quizzes");

  return { success: true as const, count: quizIds.length, quizIds };
}

export async function generateFollowUpQuizzesForFiles(formData: FormData) {
  const fileIds = formData
    .getAll("fileIds")
    .map((id) => id.toString())
    .filter(Boolean);

  if (fileIds.length === 0) {
    throw new Error("Select at least one file.");
  }

  const quizIds: string[] = [];

  for (const fileId of fileIds) {
    const result = await generateQuiz(fileId, {
      fresh: true,
      titlePrefix: "Follow-up quiz",
    });
    quizIds.push(result.quizId);
  }

  revalidatePath("/practice");
  revalidatePath("/quizzes");

  return { success: true as const, count: quizIds.length, quizIds };
}

export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>,
) {
  const user = await getUser();

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId: user.id },
    include: { questions: true, file: { include: { aiMeta: true } } },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  // Calculate score
  let score = 0;
  const wrongTopics: string[] = [];

  for (const question of quiz.questions) {
    const selected = answers[question.id];
    if (selected === question.correctAnswer) {
      score++;
    } else {
      wrongTopics.push(question.topic);
    }
  }

  // Record attempt
  await prisma.quizAttempt.create({
    data: {
      quizId,
      userId: user.id,
      score,
      answers,
    },
  });

  // Update weak topic signals
  const topicCounts = new Map<string, number>();
  for (const topic of wrongTopics) {
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  }

  for (const [topic, incorrectCount] of topicCounts) {
    await prisma.weakTopicSignal.upsert({
      where: {
        userId_topic: {
          userId: user.id,
          topic,
        },
      },
      update: {
        incorrectCount: { increment: incorrectCount },
        totalAttempts: { increment: incorrectCount },
        lastEncounteredAt: new Date(),
        subjectId: quiz.subjectId,
        fileId: quiz.fileId,
      },
      create: {
        userId: user.id,
        subjectId: quiz.subjectId,
        fileId: quiz.fileId,
        topic,
        incorrectCount,
        totalAttempts: incorrectCount,
      },
    });
  }

  // Also record correct topics to increment totalAttempts
  const correctTopics = quiz.questions
    .filter((q) => answers[q.id] === q.correctAnswer)
    .map((q) => q.topic);

  const correctTopicCounts = new Map<string, number>();
  for (const topic of correctTopics) {
    if (!topicCounts.has(topic)) {
      correctTopicCounts.set(topic, (correctTopicCounts.get(topic) || 0) + 1);
    }
  }

  for (const [topic, count] of correctTopicCounts) {
    await prisma.weakTopicSignal.upsert({
      where: {
        userId_topic: {
          userId: user.id,
          topic,
        },
      },
      update: {
        totalAttempts: { increment: count },
        lastEncounteredAt: new Date(),
      },
      create: {
        userId: user.id,
        subjectId: quiz.subjectId,
        fileId: quiz.fileId,
        topic,
        incorrectCount: 0,
        totalAttempts: count,
      },
    });
  }

  revalidatePath(`/quizzes/${quizId}`);
  revalidatePath("/dashboard");

  return { success: true as const, score, total: quiz.questions.length };
}

export async function deleteQuiz(quizId: string) {
  const user = await getUser();

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId: user.id },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  await prisma.quiz.delete({ where: { id: quizId } });

  revalidatePath(`/files/${quiz.fileId}`);
  revalidatePath(`/subjects/${quiz.subjectId}`);
  revalidatePath("/quizzes");
  revalidatePath("/practice");

  return { success: true as const };
}

export async function getWeakTopicSignals() {
  const user = await getUser();

  return prisma.weakTopicSignal.findMany({
    where: { userId: user.id },
    orderBy: [
      { incorrectCount: "desc" },
      { totalAttempts: "asc" },
    ],
    take: 10,
  });
}
