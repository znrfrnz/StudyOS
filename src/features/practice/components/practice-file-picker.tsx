"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { generateFlashcardsForFiles } from "@/features/flashcards/actions";
import { generateFollowUpQuizzesForFiles } from "@/features/quizzes/actions";

interface PracticeFile {
  id: string;
  name: string;
  estimatedMinutes: number | null;
  difficultyScore: number | null;
}

interface PracticeFilePickerProps {
  files: PracticeFile[];
  subjectId: string;
}

interface StartPracticeButtonProps {
  files: PracticeFile[];
  subjectId: string;
}

function buildFileFormData(fileIds: string[]) {
  const formData = new FormData();
  fileIds.forEach((id) => formData.append("fileIds", id));
  return formData;
}

async function generatePracticeSet(fileIds: string[]) {
  const formData = buildFileFormData(fileIds);
  await generateFlashcardsForFiles(formData);
  return generateFollowUpQuizzesForFiles(formData);
}

export function StartPracticeButton({ files, subjectId }: StartPracticeButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startPractice() {
    if (files.length === 0) {
      setError("Upload and process at least one file first.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const quizResult = await generatePracticeSet(files.map((file) => file.id));
        const quizId = quizResult.quizIds[0];
        router.push(`/practice?subjectId=${subjectId}${quizId ? `&quizId=${quizId}` : ""}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not start practice.");
      }
    });
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={isPending || files.length === 0}
        onClick={startPractice}
        className="btn btn-default h-12 w-full gap-2 disabled:opacity-50 sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}
        {isPending ? "Starting practice..." : "Start practice"}
      </button>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function PracticeFilePicker({ files, subjectId }: PracticeFilePickerProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(files.map((file) => file.id));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const allSelected = files.length > 0 && selectedIds.length === files.length;

  function toggleFile(fileId: string) {
    setError(null);
    setSelectedIds((current) =>
      current.includes(fileId)
        ? current.filter((id) => id !== fileId)
        : [...current, fileId],
    );
  }

  function toggleAll() {
    setError(null);
    setSelectedIds(allSelected ? [] : files.map((file) => file.id));
  }

  function runAction() {
    if (selectedIds.length === 0) {
      setError("Select at least one relevant file.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const quizResult = await generatePracticeSet(selectedIds);
        const quizId = quizResult.quizIds[0];
        router.push(`/practice?subjectId=${subjectId}${quizId ? `&quizId=${quizId}` : ""}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not generate practice.");
      }
    });
  }

  if (files.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
        Upload and process a PDF before generating practice.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {selectedIds.length} of {files.length} file{files.length !== 1 ? "s" : ""} selected
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>

      <div className="grid gap-2">
        {files.map((file) => {
          const selected = selectedIds.includes(file.id);
          return (
            <label
              key={file.id}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition-colors ${
                selected ? "border-primary bg-muted" : "border-border bg-background hover:bg-muted/60"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleFile(file.id)}
                className="mt-1"
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">{file.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {file.estimatedMinutes ? `${file.estimatedMinutes} min` : "Time unknown"}
                  {" · "}
                  Difficulty {file.difficultyScore ?? "?"}/10
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={isPending || selectedIds.length === 0}
        onClick={runAction}
        className="btn btn-default w-full gap-2 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}
        {isPending ? "Starting practice..." : "Start custom practice"}
      </button>
    </div>
  );
}
