"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";
import { uploadFileToStorage, deleteFileFromStorage } from "@/lib/storage/supabase";
import { extractTextFromPdf } from "@/lib/ai/pdf";
import { generateFileMetadata, chunkText } from "@/lib/ai/openai";

export async function uploadAndProcessFile(formData: FormData) {
  const user = await requireUser();
  const subjectId = formData.get("subjectId") as string;
  const file = formData.get("file") as File;

  if (!file || !subjectId) {
    throw new Error("Missing file or subject");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported");
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("File too large (max 10MB)");
  }

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId: user.id },
  });

  if (!subject) {
    throw new Error("Subject not found");
  }

  const fileId = uuidv4();
  const ext = file.name.split(".").pop() || "pdf";
  const storagePath = `${user.id}/${subjectId}/${fileId}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to storage
  await uploadFileToStorage(storagePath, buffer, file.type);

  // Create file record
  const fileRecord = await prisma.file.create({
    data: {
      id: fileId,
      userId: user.id,
      subjectId,
      name: file.name,
      storagePath,
      mimeType: file.type,
      sizeBytes: file.size,
      processingStatus: "processing",
    },
  });

  try {
    // Extract text
    const text = await extractTextFromPdf(buffer);

    // Create chunks
    const chunks = chunkText(text);
    await prisma.fileChunk.createMany({
      data: chunks.map((content, index) => ({
        fileId: fileRecord.id,
        chunkIndex: index,
        content,
      })),
    });

    // Generate AI metadata
    const metadata = await generateFileMetadata(text);

    await prisma.fileAiMetadata.create({
      data: {
        fileId: fileRecord.id,
        summary: metadata.summary,
        topics: metadata.topics,
        difficultyScore: metadata.difficultyScore,
        estimatedMinutes: metadata.estimatedMinutes,
      },
    });

    // Mark as ready
    await prisma.file.update({
      where: { id: fileRecord.id },
      data: { processingStatus: "ready" },
    });
  } catch (error) {
    // Mark as failed
    await prisma.file.update({
      where: { id: fileRecord.id },
      data: { processingStatus: "failed" },
    });

    throw error;
  }

  revalidatePath(`/subjects/${subjectId}`);

  return { success: true as const, fileId, subjectId };
}

export async function getFilesBySubject(subjectId: string) {
  const user = await requireUser();

  return prisma.file.findMany({
    where: { subjectId, userId: user.id },
    orderBy: { uploadedAt: "desc" },
    include: { aiMeta: true },
  });
}

export async function getRecentFiles(limit = 5) {
  const user = await requireUser();

  return prisma.file.findMany({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" },
    take: limit,
    include: { subject: true, aiMeta: true },
  });
}

export async function getReadyFilesForPractice() {
  const user = await requireUser();

  return prisma.file.findMany({
    where: {
      userId: user.id,
      processingStatus: "ready",
    },
    orderBy: [{ subject: { name: "asc" } }, { uploadedAt: "desc" }],
    include: { subject: true, aiMeta: true },
  });
}

export async function getFile(fileId: string) {
  const user = await requireUser();

  return prisma.file.findFirst({
    where: { id: fileId, userId: user.id },
    include: {
      aiMeta: true,
      chunks: {
        orderBy: { chunkIndex: "asc" },
      },
      subject: true,
    },
  });
}

export async function deleteFile(fileId: string) {
  const user = await requireUser();

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId: user.id },
  });

  if (!file) {
    throw new Error("File not found");
  }

  // Delete from storage first
  try {
    await deleteFileFromStorage(file.storagePath);
  } catch {
    // Continue even if storage delete fails
  }

  await prisma.flashcard.deleteMany({
    where: { fileId, userId: user.id },
  });

  await prisma.weakTopicSignal.deleteMany({
    where: { fileId, userId: user.id },
  });

  await prisma.file.delete({
    where: { id: fileId },
  });

  revalidatePath(`/subjects/${file.subjectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/flashcards");
  revalidatePath("/quizzes");
  revalidatePath("/practice");

  return { success: true as const, subjectId: file.subjectId };
}
