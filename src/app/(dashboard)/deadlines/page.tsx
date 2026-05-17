import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Plus } from "lucide-react";

import {
  createDeadlineFromDeadlines,
} from "@/features/deadlines/actions";
import { getDeadlinesPageData } from "@/features/dashboard/queries";
import { DeadlineCalendar } from "@/features/deadlines/components/deadline-calendar";
import { DeleteDeadlineButton } from "@/features/deadlines/components/delete-deadline-button";

export const metadata: Metadata = {
  title: "Deadlines",
};

const errorMessages: Record<string, string> = {
  invalid_deadline: "Check the deadline details and try again.",
  invalid_deadline_date: "Choose a valid deadline date.",
  subject_not_found: "Choose an existing subject before adding a deadline.",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(date: Date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function getDueCopy(days: number) {
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days left`;
}

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { deadlines, subjects } = await getDeadlinesPageData();
  const errorMessage = resolvedSearchParams.error
    ? errorMessages[resolvedSearchParams.error]
    : null;
  const calendarDeadlines = deadlines.map((deadline) => ({
    id: deadline.id,
    title: deadline.title,
    dueAt: deadline.dueAt.toISOString(),
    priority: deadline.priority,
    subjectName: deadline.subject?.name ?? null,
    subjectColor: deadline.subject?.color ?? null,
  }));
  const calendarSubjects = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));

  return (
    <div className="page-shell">
      <div className="content-shell">
        <header className="page-header">
          <div>
            <h1 className="page-title">Deadline calendar</h1>
          </div>
          <p className="header-copy">
            Scan the month first, then add or review deadlines without leaving the page.
          </p>
        </header>

        <div className="grid gap-8">
          <DeadlineCalendar deadlines={calendarDeadlines} subjects={calendarSubjects} />

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="surface-card" aria-labelledby="add-deadline-title">
              <div className="mb-5 flex items-start gap-3">
                <Plus className="mt-1 size-5 text-muted-foreground" />
                <div>
                  <h2 id="add-deadline-title" className="text-xl font-semibold">
                    New deadline
                  </h2>
                </div>
              </div>

              {errorMessage && (
                <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                  {errorMessage}
                </p>
              )}

              {subjects.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background p-5 text-center">
                  <p className="font-medium">Create a subject first</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Deadlines need a subject so plans know what to schedule.
                  </p>
                  <Link href="/plan" className="btn btn-default mt-4 inline-flex">
                    Start setup
                  </Link>
                </div>
              ) : (
                <form action={createDeadlineFromDeadlines} className="grid gap-3">
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
                      placeholder="e.g. Biology exam"
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

                  <button type="submit" className="btn btn-default mt-1 w-full gap-2">
                    <Plus className="size-4" />
                    Add deadline
                  </button>
                </form>
              )}
            </section>

            <section className="surface-card" aria-labelledby="deadlines-added-title">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 id="deadlines-added-title" className="text-xl font-semibold">
                    {deadlines.length} total
                  </h2>
                </div>
                <Calendar className="size-5 text-muted-foreground" />
              </div>

              {deadlines.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background p-6 text-center">
                  <Calendar className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">No deadlines yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add one with the form beside this card.
                  </p>
                </div>
              ) : (
                <div className="stack-sm">
                  {deadlines.map((deadline) => {
                    const days = daysUntil(deadline.dueAt);

                    return (
                      <div
                        key={deadline.id}
                        className="rounded-2xl border border-border bg-background p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className="size-3 shrink-0 rounded-full"
                                style={{ backgroundColor: deadline.subject?.color || "var(--muted)" }}
                                aria-hidden="true"
                              />
                              <span className="text-sm font-medium text-muted-foreground">
                                {deadline.subject?.name}
                              </span>
                            </div>
                            <h3 className="mt-3 font-semibold">{deadline.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Due {formatDate(deadline.dueAt)} · {getDueCopy(days)}
                            </p>
                          </div>
                          <DeleteDeadlineButton id={deadline.id} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
