import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createSubject } from "@/features/subjects/actions";
import { ColorPicker } from "@/features/subjects/components/color-picker";
import { IconPicker } from "@/features/subjects/components/icon-picker";

export default function NewSubjectPage() {
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

        <div className="mx-auto max-w-lg">
          <h1 className="page-title">Create a subject</h1>

          <form action={createSubject} className="mt-8 grid gap-4">
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
                className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Calculus II"
              />
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Color</span>
              <ColorPicker name="color" />
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Icon</span>
              <IconPicker name="icon" />
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

            <div className="mt-2 flex gap-3">
              <Link
                href="/subjects"
                className="btn btn-secondary flex-1 justify-center"
              >
                Cancel
              </Link>
              <button type="submit" className="btn btn-default flex-1">
                Create subject
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
