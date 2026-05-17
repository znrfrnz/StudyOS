"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { deleteAvailabilityBlock } from "@/features/availability/actions";

export function DeleteAvailabilityButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Remove availability block"
      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
      onClick={() => {
        if (!confirm("Remove this availability block?")) return;
        startTransition(async () => {
          await deleteAvailabilityBlock(id);
        });
      }}
    >
      <Trash2 className="size-4" />
    </button>
  );
}
