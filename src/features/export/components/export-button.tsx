"use client";

import { useTransition, useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
  action: () => Promise<string>;
  filename: string;
  mimeType: string;
  label: string;
  compact?: boolean;
}

export function ExportButton({ action, filename, mimeType, label, compact = false }: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const content = await action();
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Export failed");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className={`${compact ? "inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted" : "btn btn-secondary inline-flex w-full items-center justify-center gap-2"} disabled:opacity-50`}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {isPending ? "Exporting..." : label}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}
