import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Upload, FileText, Loader2, AlertCircle } from "lucide-react";

import { getSubject, deleteSubject, updateSubject } from "@/features/subjects/actions";
import { getFilesBySubject } from "@/features/files/actions";
import { DeleteSubjectButton } from "@/features/subjects/components/delete-subject-button";
import { UploadFileForm } from "@/features/files/components/upload-file-form";
import { ColorPicker } from "@/features/subjects/components/color-picker";
import { IconPicker } from "@/features/subjects/components/icon-picker";
import { SubjectIcon } from "@/features/subjects/components/subject-icons";

function StatusBadge({ status }: { status: string }) {
  if (status === "ready") {
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
        Ready
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
        <Loader2 className="size-3 animate-spin" />
        Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
      <AlertCircle className="size-3" />
      Failed
    </span>
  );
}

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = await getSubject(id);

  if (!subject) {
    notFound();
  }

  const files = await getFilesBySubject(id);

  return (
    <div className="page-shell">
      <div className="content-shell">
        <Link
          href="/subjects"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to subjects
        </Link>

        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: subject.color || "var(--muted)" }}
            >
              <SubjectIcon
                name={subject.icon}
                className="size-6"
                style={{ color: subject.color ? "#000" : undefined }}
              />
            </div>
            <div>
              <h1 className="page-title">{subject.name}</h1>
            </div>
          </div>
          <form action={deleteSubject.bind(null, id)}>
            <DeleteSubjectButton />
          </form>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Files section */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Files</h2>
              <span className="text-sm text-muted-foreground">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </span>
            </div>

            {files.length === 0 ? (
              <div className="surface-card py-12 text-center">
                <FileText className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 font-medium">No files yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a PDF to extract summaries and topics.
                </p>
              </div>
            ) : (
              <div className="stack-sm">
                {files.map((file) => (
                  <Link
                    key={file.id}
                    href={`/files/${file.id}`}
                    className="surface-card flex items-start gap-4 transition-colors hover:border-primary"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <FileText className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{file.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {Math.round(file.sizeBytes / 1024)} KB
                        {" · "}
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                      {file.aiMeta && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {file.aiMeta.estimatedMinutes} min · Difficulty {file.aiMeta.difficultyScore}/10
                        </p>
                      )}
                    </div>
                    <StatusBadge status={file.processingStatus} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upload + Edit */}
          <div className="stack-md">
            <div className="surface-card">
              <h2 className="mb-4 text-xl font-semibold">Upload PDF</h2>
              <UploadFileForm subjectId={id} />
            </div>

            <form action={updateSubject.bind(null, id)} className="surface-card">
              <h2 className="mb-4 text-xl font-semibold">Subject info</h2>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={100}
                    defaultValue={subject.name}
                    className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-medium">Color</span>
                  <ColorPicker name="color" defaultValue={subject.color} />
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-medium">Icon</span>
                  <IconPicker name="icon" defaultValue={subject.icon} />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Importance
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    defaultValue={subject.priority > 0 ? 1 : 0}
                    className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={0}>Minor</option>
                    <option value={1}>Major</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-default mt-1">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
