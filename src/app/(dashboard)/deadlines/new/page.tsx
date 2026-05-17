import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createDeadline } from "@/features/deadlines/actions";
import { getSubjects } from "@/features/subjects/actions";

const importanceOptions = [
  { label: "Normal", value: 0 },
  { label: "Important", value: 5 },
  { label: "Critical", value: 10 },
];

export default async function NewDeadlinePage() {
  const subjects = await getSubjects();

  return (
    <div className="page-shell">
      <div className="content-shell">
        <Link
          href="/deadlines"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to deadlines
        </Link>

        <div className="mx-auto max-w-lg">
          <h1 className="page-title">Add a deadline</h1>

          {subjects.length === 0 ? (
            <div className="mt-8 surface-card py-12 text-center">
              <p className="font-medium">No subjects yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a subject before adding deadlines.
              </p>
              <Link
                href="/subjects/new"
                className="btn btn-default mt-6 inline-flex items-center gap-2"
              >
                Create subject
              </Link>
            </div>
          ) : (
            <form action={createDeadline} className="mt-8 grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="subjectId" className="text-sm font-medium">
                  Subject
                </label>
                <select
                  id="subjectId"
                  name="subjectId"
                  required
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder='e.g. "Calculus Midterm"'
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="dueAt" className="text-sm font-medium">
                  Due date
                </label>
                <input
                  id="dueAt"
                  name="dueAt"
                  type="datetime-local"
                  required
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Importance
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={0}
                >
                  {importanceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-2 flex gap-3">
                <Link
                  href="/deadlines"
                  className="btn btn-secondary flex-1 justify-center"
                >
                  Cancel
                </Link>
                <button type="submit" className="btn btn-default flex-1">
                  Add deadline
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
