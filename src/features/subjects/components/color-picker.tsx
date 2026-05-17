"use client";

import { useState } from "react";

const PRESET_COLORS = [
  { value: "#DBEAFE", label: "Petrol" },
  { value: "#DCFCE7", label: "Emerald" },
  { value: "#FEF3C7", label: "Jade" },
  { value: "#FEE2E2", label: "Coral" },
  { value: "#F3E8FF", label: "Lavender" },
];

export function ColorPicker({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string | null;
}) {
  const [selected, setSelected] = useState(defaultValue || PRESET_COLORS[0].value);

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={selected} />
      <div className="flex flex-wrap gap-3">
        {PRESET_COLORS.map((color) => {
          const isSelected = selected === color.value;
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelected(color.value)}
              title={color.label}
              aria-label={color.label}
              className={`relative flex size-10 items-center justify-center rounded-full transition-transform ${
                isSelected
                  ? "ring-2 ring-primary ring-offset-2 scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: color.value }}
            >
              {isSelected && (
                <svg
                  className="size-5 text-black/60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function getDefaultColor() {
  return PRESET_COLORS[0].value;
}
