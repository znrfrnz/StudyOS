"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { deleteQuiz } from "@/features/quizzes/actions";

export function DeleteQuizButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Delete quiz"
      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
      onClick={() => {
        if (!confirm("Delete this quiz?")) return;
        startTransition(async () => {
          await deleteQuiz(id);
        });
      }}
    >
      <Trash2 className="size-4" />
    </button>
  );
}
