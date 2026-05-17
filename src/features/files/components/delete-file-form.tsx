"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { deleteFile } from "@/features/files/actions";

export function DeleteFileForm({ fileId }: { fileId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!confirm("Delete this file and its extracted data?")) return;

    setError(null);
    setPending(true);
    try {
      const result = await deleteFile(fileId);
      if (result.success) {
        router.push(`/subjects/${result.subjectId}`);
      }
    } catch (err: unknown) {
      setPending(false);
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={handleSubmit}
        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
      >
        <Trash2 className="size-4" />
        {pending ? "Deleting..." : "Delete"}
      </button>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
