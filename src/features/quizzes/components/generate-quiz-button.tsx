"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, HelpCircle } from "lucide-react";

import { generateQuiz } from "@/features/quizzes/actions";

export function GenerateQuizButton({ fileId }: { fileId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateQuiz(fileId);
        if (result.success) {
          router.push(`/quizzes/${result.quizId}`);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to generate quiz");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="btn btn-secondary inline-flex w-full items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <HelpCircle className="size-4" />
        )}
        {isPending ? "Generating quiz..." : "Generate quiz"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}
