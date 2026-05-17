"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";
import { generateFlashcards } from "@/lib/ai/openai";

export async function getFlashcards() {
  const user = await requireUser();

  return prisma.flashcard.findMany({
    where: { userId: user.id },
    orderBy: [
      { masteryLevel: "asc" },
      { lastReviewedAt: "asc" },
    ],
    include: { subject: true },
  });
}

export async function getFlashcardsBySubject(subjectId: string) {
  const user = await requireUser();

  return prisma.flashcard.findMany({
    where: { subjectId, userId: user.id },
    orderBy: [
      { masteryLevel: "asc" },
      { lastReviewedAt: "asc" },
    ],
    include: { subject: true },
  });
}

export async function generateFlashcardsForFile(fileId: string) {
  const user = await requireUser();

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId: user.id },
    include: { aiMeta: true, subject: true, chunks: true },
  });

  if (!file) {
    throw new Error("File not found");
  }

  if (file.processingStatus !== "ready" || !file.aiMeta) {
    throw new Error("File is not ready for flashcard generation");
  }

  const existingCount = await prisma.flashcard.count({
    where: { fileId: file.id, userId: user.id },
  });

  if (existingCount > 0) {
    return { success: true as const, count: existingCount };
  }

  const textContent = file.chunks.map((c) => c.content).join("\n\n");
  const topics = file.aiMeta.topics.length > 0 ? file.aiMeta.topics : [file.name];

  const cards = await generateFlashcards(textContent, topics, 8);

  if (cards.length === 0) {
    throw new Error("Could not generate flashcards from this file");
  }

  await prisma.flashcard.createMany({
    data: cards.map((c) => ({
      userId: user.id,
      subjectId: file.subjectId,
      fileId: file.id,
      front: c.front,
      back: c.back,
    })),
  });

  revalidatePath(`/files/${fileId}`);
  revalidatePath(`/subjects/${file.subjectId}`);
  revalidatePath("/flashcards");
  revalidatePath("/practice");

  return { success: true as const, count: cards.length };
}

export async function generateFlashcardsForFiles(formData: FormData) {
  const fileIds = formData
    .getAll("fileIds")
    .map((id) => id.toString())
    .filter(Boolean);

  if (fileIds.length === 0) {
    throw new Error("Select at least one file.");
  }

  let generatedCount = 0;

  for (const fileId of fileIds) {
    const result = await generateFlashcardsForFile(fileId);
    generatedCount += result.count;
  }

  revalidatePath("/practice");
  revalidatePath("/flashcards");

  return { success: true as const, count: generatedCount };
}

export async function updateFlashcardMastery(
  flashcardId: string,
  delta: number,
) {
  const user = await requireUser();

  const card = await prisma.flashcard.findFirst({
    where: { id: flashcardId, userId: user.id },
  });

  if (!card) {
    throw new Error("Flashcard not found");
  }

  const newLevel = Math.max(0, Math.min(5, card.masteryLevel + delta));

  await prisma.flashcard.update({
    where: { id: flashcardId },
    data: {
      masteryLevel: newLevel,
      lastReviewedAt: new Date(),
    },
  });

  revalidatePath("/flashcards");
  revalidatePath("/practice");

  return { success: true as const, masteryLevel: newLevel };
}

export async function deleteFlashcard(flashcardId: string) {
  const user = await requireUser();

  const card = await prisma.flashcard.findFirst({
    where: { id: flashcardId, userId: user.id },
  });

  if (!card) {
    throw new Error("Flashcard not found");
  }

  await prisma.flashcard.delete({ where: { id: flashcardId } });

  revalidatePath("/flashcards");
  revalidatePath("/practice");

  return { success: true as const };
}
