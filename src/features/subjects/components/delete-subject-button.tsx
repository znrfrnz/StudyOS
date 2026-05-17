"use client";

import { Trash2 } from "lucide-react";

export function DeleteSubjectButton() {
  return (
    <button
      type="submit"
      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
      onClick={(e) => {
        if (!confirm("Delete this subject?")) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 className="size-4" />
      Delete
    </button>
  );
}
