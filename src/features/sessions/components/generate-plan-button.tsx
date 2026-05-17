"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { generateStudyPlan } from "@/features/sessions/actions";

export function GeneratePlanButton({
  subjectId,
  className = "",
}: {
  subjectId?: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await generateStudyPlan(subjectId);
        router.push("/sessions");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to generate plan.");
      }
    });
  }

  return (
    <div className={className ? "grid gap-2" : "inline-grid gap-2"}>
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className={`btn btn-default inline-flex items-center gap-2 disabled:opacity-50 ${className}`}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {isPending ? "Generating..." : "Generate plan"}
      </button>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
