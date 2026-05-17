"use client";

import { useTransition } from "react";
import { Check, X, SkipForward, Loader2 } from "lucide-react";

import { updateSessionStatus } from "@/features/sessions/actions";

export function SessionStatusButtons({ sessionId }: { sessionId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleStatus(status: "completed" | "missed" | "skipped") {
    startTransition(async () => {
      await updateSessionStatus(sessionId, status);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isPending ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <button
            type="button"
            onClick={() => handleStatus("completed")}
            className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
          >
            <Check className="size-3" />
            Done
          </button>
          <button
            type="button"
            onClick={() => handleStatus("missed")}
            className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <X className="size-3" />
            Missed
          </button>
          <button
            type="button"
            onClick={() => handleStatus("skipped")}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <SkipForward className="size-3" />
            Skip
          </button>
        </>
      )}
    </div>
  );
}
