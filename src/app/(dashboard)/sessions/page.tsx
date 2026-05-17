import Link from "next/link";
import { Clock, Calendar, CheckCircle2, XCircle, BookOpen, Timer } from "lucide-react";

import { getSessionsPageData } from "@/features/dashboard/queries";
import { exportStudyPlanMarkdown, exportStudyPlanIcs } from "@/features/export/actions";
import { SessionStatusButtons } from "@/features/sessions/components/session-status-buttons";
import { ExportButton } from "@/features/export/components/export-button";
import { SubjectIcon } from "@/features/subjects/components/subject-icons";
import { getStudyMethod, getSessionChunks } from "@/lib/study-methods";

const statusConfig: Record<string, { label: string; className: string }> = {
  planned: {
    label: "Planned",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  missed: {
    label: "Missed",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  skipped: {
    label: "Skipped",
    className: "bg-muted text-muted-foreground border-border",
  },
};

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateShort(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function SessionCard({
  session,
  showDate = false,
}: {
  session: Awaited<ReturnType<typeof getSessionsPageData>>["upcoming"][0];
  showDate?: boolean;
}) {
  const status = statusConfig[session.status] || statusConfig.planned;
  const method = getStudyMethod({
    durationMinutes: session.durationMinutes,
    sessionType: session.sessionType,
  });
  const chunks = getSessionChunks(session.durationMinutes);

  return (
    <div className="surface-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {showDate && (
              <span className="text-sm font-medium text-muted-foreground">
                {formatDateShort(session.startsAt)}
              </span>
            )}
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
            >
              {status.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {session.durationMinutes} min
            </span>
          </div>

          <h3 className="mt-2 text-lg font-semibold">
            {session.goal || "Study session"}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {session.subject && (
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-flex size-5 items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      session.subject.color || "var(--muted)",
                  }}
                >
                  <SubjectIcon
                    name={session.subject.icon}
                    className="size-3"
                    style={{ color: session.subject.color ? "#000" : undefined }}
                  />
                </span>
                {session.subject.name}
              </span>
            )}
            {session.file && (
              <Link
                href={`/files/${session.file.id}`}
                className="hover:text-foreground hover:underline"
              >
                {session.file.name}
              </Link>
            )}
            {session.topic && <span>{session.topic}</span>}
          </div>

          {session.reason && (
            <p className="mt-2 text-sm text-muted-foreground">
              {session.reason}
            </p>
          )}

          <div className="mt-3 rounded-2xl border border-border bg-background p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Timer className="size-3" />
                {method.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {method.cadence}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {chunks.map((chunk, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    chunk.type === "break"
                      ? "border border-border bg-background text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {chunk.type === "break" ? "☕" : "▶"}
                  {chunk.minutes}m {chunk.label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {method.summary}
            </p>
            <ol className="mt-2 grid gap-1 text-sm text-muted-foreground">
              {method.steps.map((step, index) => (
                <li key={step}>
                  <span className="font-medium text-foreground">{index + 1}.</span> {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-1 text-sm text-muted-foreground">
            {formatTime(session.startsAt)} - {formatTime(session.endsAt)}
          </div>
        </div>

        {session.status === "planned" && (
          <div className="shrink-0">
            <SessionStatusButtons sessionId={session.id} />
          </div>
        )}
      </div>
    </div>
  );
}

export default async function SessionsPage() {
  const { today, upcoming } = await getSessionsPageData();

  return (
    <div className="page-shell">
      <div className="content-shell">
        <header className="page-header">
          <div>
            <h1 className="page-title">Your study plan</h1>
          </div>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.5fr]">
          <div className="stack-md">
            <section>
              <h2 className="mb-4 text-xl font-semibold">Today</h2>
              {today.length === 0 ? (
                <div className="surface-card py-12 text-center">
                  <Clock className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">Nothing planned today</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate a plan to see sessions here.
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
                  {today.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Upcoming</h2>
              {upcoming.length === 0 ? (
                <div className="surface-card py-12 text-center">
                  <BookOpen className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">No upcoming sessions</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate a plan to schedule future sessions.
                  </p>
                </div>
              ) : (
                <div className="stack-sm">
                  {upcoming.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      showDate
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="stack-md">
            <section>
              <h2 className="invisible mb-4 text-xl font-semibold">Overview</h2>
              <div className="stack-sm">
                <div className="surface-card">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-background p-3 text-center">
                      <CheckCircle2 className="size-5 text-muted-foreground" />
                      <p className="text-2xl font-semibold leading-none text-foreground">
                        {upcoming.filter((s) => s.status === "completed").length +
                          today.filter((s) => s.status === "completed").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Done</p>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-background p-3 text-center">
                      <Clock className="size-5 text-muted-foreground" />
                      <p className="text-2xl font-semibold leading-none text-foreground">
                        {upcoming.filter((s) => s.status === "planned").length +
                          today.filter((s) => s.status === "planned").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Plan</p>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-background p-3 text-center">
                      <XCircle className="size-5 text-muted-foreground" />
                      <p className="text-2xl font-semibold leading-none text-foreground">
                        {upcoming.filter((s) => s.status === "missed").length +
                          today.filter((s) => s.status === "missed").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Miss</p>
                    </div>
                  </div>
                </div>

                <div className="surface-card">
                  <div className="grid grid-cols-2 gap-2">
                    <ExportButton
                      action={exportStudyPlanMarkdown}
                      filename="study-plan.md"
                      mimeType="text/markdown"
                      label="Markdown"
                      compact
                    />
                    <ExportButton
                      action={exportStudyPlanIcs}
                      filename="study-plan.ics"
                      mimeType="text/calendar"
                      label=".ics"
                      compact
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
