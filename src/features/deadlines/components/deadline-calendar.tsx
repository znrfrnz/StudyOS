"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Calendar, CheckCircle2, Clock, Plus } from "lucide-react";

import { createDeadlineFromDeadlines } from "@/features/deadlines/actions";

interface CalendarDeadline {
  id: string;
  title: string;
  dueAt: string;
  priority: number;
  subjectName: string | null;
  subjectColor: string | null;
}

interface CalendarSubject {
  id: string;
  name: string;
}

interface DeadlineCalendarProps {
  deadlines: CalendarDeadline[];
  subjects: CalendarSubject[];
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function daysUntil(date: Date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function getCalendarDays() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay.getDay() }, (_, index) => ({
    key: `blank-${index}`,
    date: null,
  }));
  const days = Array.from({ length: daysInMonth }, (_, index) => ({
    key: `day-${index + 1}`,
    date: new Date(year, month, index + 1),
  }));

  return {
    monthLabel: formatMonth(firstDay),
    today,
    days: [...blanks, ...days],
  };
}

export function DeadlineCalendar({ deadlines, subjects }: DeadlineCalendarProps) {
  const [openDate, setOpenDate] = useState<string | null>(null);
  const calendarRef = useRef<HTMLElement>(null);
  const calendar = getCalendarDays();

  useEffect(() => {
    if (!openDate) return;

    function handlePointerDown(event: PointerEvent) {
      if (!calendarRef.current?.contains(event.target as Node)) {
        setOpenDate(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDate(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDate]);

  function setDueAt(formData: FormData) {
    const date = formData.get("selectedDate")?.toString();
    const time = formData.get("selectedTime")?.toString();

    if (date && time) {
      formData.set("dueAt", `${date}T${time}`);
    }

    return createDeadlineFromDeadlines(formData);
  }

  return (
    <section ref={calendarRef} className="surface-card overflow-visible" aria-labelledby="deadline-calendar-title">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 id="deadline-calendar-title" className="text-2xl font-semibold">
            {calendar.monthLabel}
          </h2>
        </div>
        <Calendar className="size-5 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {dayLabels.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1" aria-label={`${calendar.monthLabel} deadlines`}>
        {calendar.days.map((calendarDay, calendarIndex) => {
          if (!calendarDay.date) {
            return <div key={calendarDay.key} className="min-h-16 sm:min-h-24" aria-hidden="true" />;
          }

          const dateParam = formatDateParam(calendarDay.date);
          const dayDeadlines = deadlines.filter((deadline) => {
            const dueAt = new Date(deadline.dueAt);
            return (
              dueAt.getFullYear() === calendarDay.date?.getFullYear() &&
              dueAt.getMonth() === calendarDay.date?.getMonth() &&
              dueAt.getDate() === calendarDay.date?.getDate()
            );
          });
          const isToday = calendarDay.date.toDateString() === calendar.today.toDateString();
          const isOpen = openDate === dateParam;
          const alignRight = calendarIndex % 7 >= 4;

          return (
            <div
              key={calendarDay.key}
              className={`relative z-0 min-h-16 rounded-2xl border bg-background p-2 text-xs transition-colors hover:z-30 sm:min-h-24 ${
                isOpen
                  ? "z-40 border-primary bg-muted"
                  : isToday
                    ? "border-primary"
                    : "border-border hover:bg-muted/60"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenDate((current) => (current === dateParam ? null : dateParam))}
                aria-expanded={isOpen}
                aria-label={`Add deadline on ${formatDate(calendarDay.date)}`}
                className="absolute inset-0 z-0 rounded-2xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
              <p className={`relative z-10 ${isToday || isOpen ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {calendarDay.date.getDate()}
              </p>

              <div className="pointer-events-none relative z-20 mt-2 grid gap-1">
                {dayDeadlines.slice(0, 3).map((deadline) => {
                  const dueAt = new Date(deadline.dueAt);
                  const tooltipId = `deadline-${deadline.id}-tooltip`;

                  return (
                    <button
                      key={deadline.id}
                      type="button"
                      aria-describedby={tooltipId}
                      aria-label={`${deadline.title}, ${deadline.subjectName}, due ${formatDate(dueAt)} at ${formatTime(dueAt)}`}
                      className="group pointer-events-auto relative h-3 rounded-full border-0 p-0"
                      style={{ backgroundColor: deadline.subjectColor || "var(--muted)" }}
                    >
                      <span
                        id={tooltipId}
                        role="tooltip"
                        className="pointer-events-none invisible absolute left-0 top-full z-50 mt-2 w-60 rounded-2xl border border-border bg-card p-3 text-left text-xs text-foreground opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100"
                      >
                        <span className="block font-semibold">{deadline.title}</span>
                        <span className="mt-1 block text-muted-foreground">
                          {deadline.subjectName}
                        </span>
                        <span className="mt-1 block text-muted-foreground">
                          Due {formatDate(dueAt)} at {formatTime(dueAt)}
                        </span>
                      </span>
                    </button>
                  );
                })}
                {dayDeadlines.length > 3 && (
                  <span className="text-[0.65rem] text-muted-foreground">
                    +{dayDeadlines.length - 3}
                  </span>
                )}
              </div>

              {isOpen && (
                <div
                  className={`absolute top-full z-50 mt-2 w-[min(18rem,calc(100vw-3rem))] rounded-2xl border border-border bg-card p-4 text-left text-sm shadow-xl ${
                    alignRight ? "right-0" : "left-0"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">Add deadline</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(calendarDay.date)} at 9:00 AM by default.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenDate(null)}
                      className="rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Close
                    </button>
                  </div>

                  {subjects.length === 0 ? (
                    <div className="mt-3 rounded-2xl border border-border bg-background p-3 text-center">
                      <p className="text-sm font-medium">Create a subject first</p>
                      <Link href="/plan" className="btn btn-default mt-3 h-9 w-full">
                        Start setup
                      </Link>
                    </div>
                  ) : (
                    <form action={setDueAt} className="mt-3 grid gap-3">
                      <input type="hidden" name="selectedDate" value={dateParam} />
                      <div className="grid gap-1.5">
                        <label htmlFor={`calendar-subject-${dateParam}`} className="text-xs font-medium">
                          Subject
                        </label>
                        <select
                          id={`calendar-subject-${dateParam}`}
                          name="subjectId"
                          required
                          className="w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        >
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-1.5">
                        <label htmlFor={`calendar-title-${dateParam}`} className="text-xs font-medium">
                          Title
                        </label>
                        <input
                          id={`calendar-title-${dateParam}`}
                          name="title"
                          type="text"
                          required
                          maxLength={200}
                          className="w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. Biology exam"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label htmlFor={`calendar-due-${dateParam}`} className="text-xs font-medium">
                          Time
                        </label>
                        <input
                          id={`calendar-due-${dateParam}`}
                          name="selectedTime"
                          type="time"
                          required
                          defaultValue="09:00"
                          className="w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button type="submit" className="btn btn-default h-9 w-full gap-2">
                        <Plus className="size-4" />
                        Add deadline
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
