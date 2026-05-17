import Link from "next/link";
import { Plus } from "lucide-react";

import { getSubjects } from "@/features/subjects/actions";
import { SubjectIcon } from "@/features/subjects/components/subject-icons";

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="page-shell">
      <div className="content-shell">
        <header className="page-header">
          <div>
            <h1 className="page-title">Your subjects</h1>
          </div>
          <Link
            href="/subjects/new"
            className="btn btn-default inline-flex items-center gap-2"
          >
            <Plus className="size-4" />
            New subject
          </Link>
        </header>

        {subjects.length === 0 ? (
          <div className="surface-card py-16 text-center">
            <p className="text-lg font-medium">No subjects yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first subject to start organizing study materials.
            </p>
            <Link
              href="/subjects/new"
              className="btn btn-default mt-6 inline-flex items-center gap-2"
            >
              <Plus className="size-4" />
              New subject
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="rounded-2xl border border-border p-5 transition-colors hover:opacity-90"
                style={{ backgroundColor: subject.color || "var(--muted)" }}
              >
                <div className="flex items-start justify-between">
                  <SubjectIcon
                    name={subject.icon}
                    className="size-6"
                    style={{ color: subject.color ? "#000" : undefined }}
                  />
                  {subject.priority > 0 && (
                    <span className="rounded-full bg-black/10 px-2 py-1 text-xs font-medium text-black/70">
                      Major
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-black/90">{subject.name}</h2>
                <p className="mt-1 text-sm text-black/50">
                  {subject._count.files} file{subject._count.files === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
