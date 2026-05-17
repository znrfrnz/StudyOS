"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

import { uploadAndProcessFile } from "@/features/files/actions";

export function UploadFileForm({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);

    try {
      const result = await uploadAndProcessFile(formData);
      if (result.success) {
        router.push(`/files/${result.fileId}`);
      }
    } catch (err: unknown) {
      setPending(false);
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-4">
      <input type="hidden" name="subjectId" value={subjectId} />

      <div className="grid gap-2">
        <label
          htmlFor="file"
          className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 transition-colors hover:border-muted-foreground hover:bg-muted"
        >
          {pending ? (
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="size-8 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {pending ? "Uploading and processing..." : "Click to upload PDF"}
          </span>
          <span className="text-xs text-muted-foreground">
            Max 10MB · PDF only
          </span>
          <input
            id="file"
            name="file"
            type="file"
            accept="application/pdf"
            required
            disabled={pending}
            className="sr-only"
            onChange={() => formRef.current?.requestSubmit()}
          />
        </label>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </form>
  );
}
