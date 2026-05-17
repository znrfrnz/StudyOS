import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getFile } from "@/features/files/actions";
import { DeleteFileForm } from "@/features/files/components/delete-file-form";
import { GenerateQuizButton } from "@/features/quizzes/components/generate-quiz-button";
import { GenerateFlashcardsButton } from "@/features/flashcards/components/generate-flashcards-button";
import { ExportButton } from "@/features/export/components/export-button";
import { exportFileMarkdown } from "@/features/export/actions";

export default async function FileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const file = await getFile(id);

  if (!file) {
    notFound();
  }

  const meta = file.aiMeta;

  return (
    <div className="page-shell">
      <div className="content-shell">
        <Link
          href={`/subjects/${file.subjectId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to subject
        </Link>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="page-title">{file.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {Math.round(file.sizeBytes / 1024)} KB ·{" "}
              {new Date(file.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <DeleteFileForm fileId={file.id} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="stack-md">
            {meta?.summary && (
              <div className="surface-card">
                <h2 className="mb-3 text-xl font-semibold">Summary</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {meta.summary}
                </p>
              </div>
            )}

            {meta?.topics && meta.topics.length > 0 && (
              <div className="surface-card">
                <h2 className="mb-3 text-xl font-semibold">Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {meta.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!meta && file.processingStatus === "processing" && (
              <div className="surface-card py-12 text-center">
                <p className="text-muted-foreground">Processing file...</p>
              </div>
            )}

            {!meta && file.processingStatus === "failed" && (
              <div className="surface-card py-12 text-center">
                <p className="text-red-700">Processing failed.</p>
              </div>
            )}
          </div>

          <div className="stack-md">
            <div className="surface-card">
              <h2 className="mb-4 text-xl font-semibold">Metadata</h2>
              <div className="grid gap-4 text-sm">
                {meta?.difficultyScore !== null && meta?.difficultyScore !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span className="font-medium">{meta.difficultyScore}/10</span>
                  </div>
                )}
                {meta?.estimatedMinutes !== null && meta?.estimatedMinutes !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. time</span>
                    <span className="font-medium">{meta.estimatedMinutes} min</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{file.processingStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subject</span>
                  <Link
                    href={`/subjects/${file.subjectId}`}
                    className="font-medium hover:underline"
                  >
                    {file.subject.name}
                  </Link>
                </div>
              </div>
            </div>

            {file.processingStatus === "ready" && meta && (
              <div className="surface-card stack-sm">
                <h2 className="text-xl font-semibold">Practice</h2>
                <GenerateQuizButton fileId={file.id} />
                <GenerateFlashcardsButton fileId={file.id} />
              </div>
            )}

            {meta && (
              <div className="surface-card stack-sm">
                <h2 className="text-xl font-semibold">Export</h2>
                <ExportButton
                  action={exportFileMarkdown.bind(null, file.id)}
                  filename={`${file.name.replace(/\.pdf$/i, "")}-summary.md`}
                  mimeType="text/markdown"
                  label="Export summary as Markdown"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
