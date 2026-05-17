"use client";

import { useTransition, useState } from "react";
import { Loader2, Layers } from "lucide-react";

import { generateFlashcardsForFile } from "@/features/flashcards/actions";

export function GenerateFlashcardsButton({ fileId }: { fileId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await generateFlashcardsForFile(fileId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to generate flashcards");
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
          <Layers className="size-4" />
        )}
        {isPending ? "Generating..." : "Generate flashcards"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}
