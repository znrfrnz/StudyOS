import Link from "next/link";
import { Plus, BookOpen, Calendar, Clock, ArrowRight, CalendarDays, FileText } from "lucide-react";

import { getDashboardData } from "@/features/dashboard/queries";
import { SessionStatusButtons } from "@/features/sessions/components/session-status-buttons";
import { SubjectIcon } from "@/features/subjects/components/subject-icons";

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const { subjects, todaySessions, deadlines, recentFiles } = await getDashboardData();

  return (
    <div className="page-shell">
      <div className="content-shell">
        <header className="page-header">
          <div>
            <h1 className="page-title">Today&apos;s study plan</h1>
          </div>
          <p className="header-copy">
            Upload materials, set deadlines, and generate a focused study plan.
          </p>
        </header>

        <section className="dashboard-grid">
          <div className="stack-md">
            {/* Today's sessions */}
            <div className="surface-card">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="section-title mb-0">Today</h2>
                <Link
                  href="/sessions"
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all <ArrowRight className="size-3" />
                </Link>
              </div>

              {todaySessions.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background p-6 text-center">
                  <Clock className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">Nothing planned today</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate a study plan to get started.
                  </p>
                  <Link
                    href="/plan"
                    className="btn btn-default mt-4 inline-flex items-center gap-2"
                  >
                    <Calendar className="size-4" />
                    Generate plan
                  </Link>
                </div>
              ) : (
                <div className="stack-sm">
                  {todaySessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-start"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {session.subject?.color && (
                            <span
                              className="inline-flex size-4 items-center justify-center rounded-full"
                              style={{ backgroundColor: session.subject.color }}
                            >
                              <SubjectIcon name={session.subject.icon} className="size-3" style={{ color: "#000" }} />
                            </span>
                          )}
                          <span>{session.subject?.name}</span>
                          <span>·</span>
                          <span>{session.durationMinutes} min</span>
                        </div>
                        <p className="mt-1 font-medium">
                          {session.goal || "Study session"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(session.startsAt)} -{" "}
                          {formatTime(session.endsAt)}
                        </p>
                      </div>
                      {session.status === "planned" && (
                        <SessionStatusButtons sessionId={session.id} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subjects */}
            <div className="surface-card">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="section-title mb-0">Subjects</h2>
                <Link
                  href="/subjects/new"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Plus className="size-4" />
                  New
                </Link>
              </div>

              {subjects.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background p-6 text-center">
                  <BookOpen className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">No subjects yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a subject to start uploading study materials.
                  </p>
                  <Link
                    href="/subjects/new"
                    className="btn btn-default mt-4 inline-flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    Create subject
                  </Link>
                </div>
              ) : (
                <div className="stack-sm">
                  {subjects.slice(0, 5).map((subject) => (
                    <Link
                      key={subject.id}
                      href={`/subjects/${subject.id}`}
                      className="flex items-center gap-4 rounded-2xl border border-border p-4 transition-colors hover:opacity-90"
                      style={{ backgroundColor: subject.color || "var(--muted)" }}
                    >
                      <SubjectIcon
                        name={subject.icon}
                        className="size-5 shrink-0"
                        style={{ color: subject.color ? "#000" : undefined }}
                      />
                       <div className="min-w-0">
                         <h3 className="font-semibold text-black/90">{subject.name}</h3>
                         <p className="text-sm text-black/50">
                           {subject.priority > 0 ? "Major" : "Minor"}
                         </p>
                       </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="surface-card">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="section-title mb-0">Recent files</h2>
                <Link
                  href="/subjects"
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Browse <ArrowRight className="size-3" />
                </Link>
              </div>

              {recentFiles.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background p-6 text-center">
                  <BookOpen className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">No files uploaded yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Open a subject and upload a PDF to start generating study material.
                  </p>
                  <Link
                    href={subjects[0] ? `/subjects/${subjects[0].id}` : "/subjects/new"}
                    className="btn btn-default mt-4 inline-flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    {subjects[0] ? "Upload material" : "Create subject"}
                  </Link>
                </div>
              ) : (
                <div className="stack-sm">
                  {recentFiles.map((file) => (
                    <Link
                      key={file.id}
                      href={`/files/${file.id}`}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted"
                    >
                      <span
                        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: file.subject.color || "var(--muted)" }}
                      >
                        <SubjectIcon
                          name={file.subject.icon}
                          className="size-3"
                          style={{ color: file.subject.color ? "#000" : undefined }}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {file.subject.name} · {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="stack-md">
            {/* Upcoming deadlines */}
            <div className="surface-card">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="section-title mb-0">Deadlines</h2>
                <Link
                  href="/deadlines"
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all <ArrowRight className="size-3" />
                </Link>
              </div>

              {deadlines.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background p-6 text-center">
                  <Calendar className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">No deadlines yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add deadlines to generate a study plan.
                  </p>
                  <Link
                    href="/plan"
                    className="btn btn-default mt-4 inline-flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    Add in planner
                  </Link>
                </div>
              ) : (
                <div className="stack-sm">
                  {deadlines.slice(0, 5).map((deadline) => (
                    <div
                      key={deadline.id}
                      className="rounded-2xl border border-border bg-background p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{
                            backgroundColor:
                              deadline.subject?.color || "var(--muted)",
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {deadline.subject?.name}
                        </span>
                      </div>
                      <p className="mt-1 font-medium">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(deadline.dueAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="surface-card flex flex-col">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div className="flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-background p-4 text-center">
                  <CalendarDays className="size-5 text-muted-foreground" />
                  <p className="text-2xl font-semibold">{deadlines.length}</p>
                  <p className="text-xs text-muted-foreground">Deadlines</p>
                </div>
                <div className="flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-background p-4 text-center">
                  <BookOpen className="size-5 text-muted-foreground" />
                  <p className="text-2xl font-semibold">{subjects.length}</p>
                  <p className="text-xs text-muted-foreground">Subjects</p>
                </div>
                <div className="flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-background p-4 text-center">
                  <FileText className="size-5 text-muted-foreground" />
                  <p className="text-2xl font-semibold">{recentFiles.length}</p>
                  <p className="text-xs text-muted-foreground">Files</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
