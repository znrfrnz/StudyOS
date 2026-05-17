import { Clock } from "lucide-react";

import { getAvailabilityBlocks } from "@/features/availability/actions";
import { createAvailabilityBlock } from "@/features/availability/actions";
import { DeleteAvailabilityButton } from "@/features/availability/components/delete-availability-button";

const dayLabels = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function AvailabilityPage() {
  const blocks = await getAvailabilityBlocks();

  return (
    <div className="page-shell">
      <div className="content-shell">
        <header className="page-header">
          <div>
            <h1 className="page-title">Study hours</h1>
          </div>
          <p className="header-copy">
            Tell StudyOS when you usually have time to study.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.5fr]">
          <div>
            {blocks.length === 0 ? (
              <div className="surface-card py-16 text-center">
                <Clock className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-lg font-medium">No availability set</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your study hours so plans can fit your schedule.
                </p>
              </div>
            ) : (
              <div className="stack-sm">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className="surface-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{dayLabels[block.dayOfWeek]}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {block.startTime} - {block.endTime} · Max{" "}
                        {block.maxSessionMinutes} min per session
                      </p>
                    </div>
                    <DeleteAvailabilityButton id={block.id} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface-card h-fit">
            <h2 className="mb-4 text-xl font-semibold">Add block</h2>
            <form action={createAvailabilityBlock} className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="dayOfWeek" className="text-sm font-medium">
                  Day
                </label>
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  required
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  {dayLabels.map((label, i) => (
                    <option key={i} value={i}>
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
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
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
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="maxSessionMinutes" className="text-sm font-medium">
                  Max session length (minutes)
                </label>
                <input
                  id="maxSessionMinutes"
                  name="maxSessionMinutes"
                  type="number"
                  min={15}
                  max={480}
                  defaultValue={90}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button type="submit" className="btn btn-default mt-2 w-full">
                Add block
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
