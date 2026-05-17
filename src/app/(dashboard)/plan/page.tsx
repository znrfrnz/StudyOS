import Link from "next/link";
import { ArrowRight, Calendar, Clock, BookOpen, CheckCircle2, Plus } from "lucide-react";

import { getSubjects } from "@/features/subjects/actions";
import { getDeadlines } from "@/features/deadlines/actions";
import { getAvailabilityBlocks } from "@/features/availability/actions";
import { createSubjectFromPlan } from "@/features/subjects/actions";
import { createDeadlineFromPlan } from "@/features/deadlines/actions";
import { createAvailabilityBlockFromPlan } from "@/features/availability/actions";
import { GeneratePlanButton } from "@/features/sessions/components/generate-plan-button";
import { ExportButton } from "@/features/export/components/export-button";
import { exportStudyPlanMarkdown, exportStudyPlanIcs } from "@/features/export/actions";
import { SubjectIcon } from "@/features/subjects/components/subject-icons";
import { ColorPicker } from "@/features/subjects/components/color-picker";

const dayLabels = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const errorMessages: Record<string, string> = {
  invalid_subject: "Check the subject details and try again.",
  invalid_deadline: "Check the deadline details and try again.",
  invalid_deadline_date: "Choose a valid deadline date.",
  subject_not_found: "Choose an existing subject before adding a deadline.",
  invalid_availability: "Check the availability details and try again.",
  invalid_availability_time: "End time must be after start time.",
};

const importanceOptions = [
  { label: "Normal", value: 0 },
  { label: "Important", value: 5 },
  { label: "Critical", value: 10 },
];

export default async function PlanPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [subjects, deadlines, blocks] = await Promise.all([
    getSubjects(),
    getDeadlines(),
    getAvailabilityBlocks(),
  ]);

  const readyToGenerate = subjects.length > 0 && deadlines.length > 0 && blocks.length > 0;
  const errorMessage = resolvedSearchParams.error
    ? errorMessages[resolvedSearchParams.error]
    : null;

  return (
    <div className="page-shell">
      <div className="content-shell">
        <header className="page-header">
          <div>
            <h1 className="page-title">Study plan</h1>
          </div>
          <p className="header-copy">
            Create the required inputs and generate your plan from one place.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.5fr]">
          <div className="surface-card">
            <div className="mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {readyToGenerate ? "Generate a plan" : "Finish setup"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {readyToGenerate
                    ? "You have the prerequisites needed to schedule study sessions."
                  : "Add the missing prerequisites below. No page-hopping required."}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {!readyToGenerate ? (
              <div className="grid gap-4">
                {subjects.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-background p-5">
                    <div className="mb-4 flex items-start gap-3">
                      <BookOpen className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Create a subject</p>
                        <p className="text-sm text-muted-foreground">
                          Plans need at least one subject to schedule work against.
                        </p>
                      </div>
                    </div>
                    <form action={createSubjectFromPlan} className="grid gap-3">
                      <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Subject name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          maxLength={100}
                          className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. Calculus II"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="priority" className="text-sm font-medium">
                          Importance
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          defaultValue={0}
                          className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value={0}>Minor</option>
                          <option value={1}>Major</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <span className="text-sm font-medium">Color</span>
                        <ColorPicker name="color" />
                      </div>
                      <button type="submit" className="btn btn-default mt-1 w-full gap-2">
                        <Plus className="size-4" />
                        Create subject
                      </button>
                    </form>
                  </div>
                ) : deadlines.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-background p-5">
                    <div className="mb-4 flex items-start gap-3">
                      <Calendar className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Add a deadline</p>
                        <p className="text-sm text-muted-foreground">
                          Deadlines tell StudyOS what to prioritize and when to stop.
                        </p>
                      </div>
                    </div>
                    <form action={createDeadlineFromPlan} className="grid gap-3">
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
                          Deadline title
                        </label>
                        <input
                          id="title"
                          name="title"
                          type="text"
                          required
                          maxLength={200}
                          className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. Midterm exam"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
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
                          <label htmlFor="deadlinePriority" className="text-sm font-medium">
                            Importance
                          </label>
                          <select
                            id="deadlinePriority"
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
                      </div>
                      <button type="submit" className="btn btn-default mt-1 w-full gap-2">
                        <Plus className="size-4" />
                        Add deadline
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                    <div>
                      <p className="font-medium">Deadline added</p>
                      <p className="text-sm">
                        {deadlines.length} deadline{deadlines.length !== 1 ? "s" : ""} ready for planning.
                      </p>
                    </div>
                  </div>
                )}

                {blocks.length === 0 && (
                  <div className="rounded-2xl border border-border bg-background p-5">
                    <div className="mb-4 flex items-start gap-3">
                      <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Set availability</p>
                        <p className="text-sm text-muted-foreground">
                          Add at least one study window so generated sessions fit your schedule.
                        </p>
                      </div>
                    </div>
                    <form action={createAvailabilityBlockFromPlan} className="grid gap-3">
                      <div className="grid gap-2">
                        <label htmlFor="dayOfWeek" className="text-sm font-medium">
                          Day
                        </label>
                        <select
                          id="dayOfWeek"
                          name="dayOfWeek"
                          required
                          className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        >
                          {dayLabels.map((label, i) => (
                            <option key={label} value={i}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <label htmlFor="startTime" className="text-sm font-medium">
                            Start
                          </label>
                          <input
                            id="startTime"
                            name="startTime"
                            type="time"
                            required
                            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="endTime" className="text-sm font-medium">
                            End
                          </label>
                          <input
                            id="endTime"
                            name="endTime"
                            type="time"
                            required
                            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="maxSessionMinutes" className="text-sm font-medium">
                          Max session length
                        </label>
                        <input
                          id="maxSessionMinutes"
                          name="maxSessionMinutes"
                          type="number"
                          min={15}
                          max={480}
                          defaultValue={90}
                          className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button type="submit" className="btn btn-default mt-1 w-full gap-2">
                        <Plus className="size-4" />
                        Add availability
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="font-medium">Generate across all subjects</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This replaces existing planned sessions with a fresh schedule.
                  </p>
                  <GeneratePlanButton className="mt-4 w-full sm:w-auto" />
                </div>
                <div className="grid gap-3">
                  {subjects.map((subject) => {
                    const subjectDeadlines = deadlines.filter(
                      (d) => d.subjectId === subject.id,
                    );
                    const canGenerateSubject = subjectDeadlines.length > 0;
                    return (
                      <div
                        key={subject.id}
                        className="flex items-center justify-between rounded-2xl border border-border p-4"
                        style={{ backgroundColor: subject.color || "var(--muted)" }}
                      >
                        <div className="flex items-center gap-3">
                          <SubjectIcon
                            name={subject.icon}
                            className="size-5"
                            style={{ color: subject.color ? "#000" : undefined }}
                          />
                          <div>
                            <p className="font-medium text-black/90">{subject.name}</p>
                            <p className="text-sm text-black/50">
                              {subjectDeadlines.length} deadline
                              {subjectDeadlines.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        {canGenerateSubject ? (
                          <GeneratePlanButton subjectId={subject.id} />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Add a deadline first
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="stack-md">
            <div className="surface-card">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`size-2 rounded-full ${subjects.length > 0 ? "bg-green-500" : "bg-muted-foreground"}`}
                  />
                  <span>{subjects.length} subject(s) created</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`size-2 rounded-full ${deadlines.length > 0 ? "bg-green-500" : "bg-muted-foreground"}`}
                  />
                  <span>{deadlines.length} deadline(s) added</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`size-2 rounded-full ${blocks.length > 0 ? "bg-green-500" : "bg-muted-foreground"}`}
                  />
                  <span>{blocks.length} availability block(s) set</span>
                </div>
              </div>
            </div>

            <div className="surface-card stack-sm">
              <ExportButton
                action={exportStudyPlanMarkdown}
                filename="study-plan.md"
                mimeType="text/markdown"
                label="Export as Markdown"
              />
              <ExportButton
                action={exportStudyPlanIcs}
                filename="study-plan.ics"
                mimeType="text/calendar"
                label="Export as .ics"
              />
            </div>

            <div className="surface-card">
              <div className="grid gap-3">
                <Link
                  href="/sessions"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted"
                >
                  <Calendar className="size-5" />
                  <span className="font-medium">Review sessions</span>
                </Link>
                <Link
                  href="/subjects"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted"
                >
                  <BookOpen className="size-5" />
                  <span className="font-medium">Upload materials</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted"
                >
                  <ArrowRight className="size-5" />
                  <span className="font-medium">Back to dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
