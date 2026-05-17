"use client";

import { useState } from "react";
import { SUBJECT_ICONS, SubjectIcon } from "./subject-icons";

export function IconPicker({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string | null;
}) {
  const [selected, setSelected] = useState(defaultValue || "");

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={selected} />
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
        {SUBJECT_ICONS.map((icon) => {
          const isSelected = selected === icon.name;
          return (
            <button
              key={icon.name}
              type="button"
              onClick={() => setSelected(icon.name)}
              title={icon.label}
              className={`flex items-center justify-center rounded-2xl border p-2 transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
              }`}
            >
              <SubjectIcon name={icon.name} className="size-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
