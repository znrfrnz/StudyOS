export interface StudyMethod {
  name: string;
  cadence: string;
  summary: string;
  steps: string[];
}

export interface SessionChunk {
  type: "work" | "break";
  minutes: number;
  label: string;
}

export function getStudyMethod({
  durationMinutes,
  sessionType,
}: {
  durationMinutes: number;
  sessionType: string;
}): StudyMethod {
  if (sessionType === "review") {
    return {
      name: "Active recall sprint",
      cadence: durationMinutes >= 25 ? "20 min recall, 5 min correction" : "Recall first, check second",
      summary: "Start from memory before looking at notes.",
      steps: [
        "Write what you remember without opening the material.",
        "Check the source and mark gaps.",
        "Redo the missed points once before ending.",
      ],
    };
  }

  if (sessionType === "practice") {
    return {
      name: "Practice loop",
      cadence: "Attempt, check, retry misses",
      summary: "Use mistakes as the main study signal.",
      steps: [
        "Attempt questions without hints.",
        "Review only the missed or uncertain answers.",
        "Retry the misses before moving on.",
      ],
    };
  }

  if (durationMinutes >= 75) {
    return {
      name: "Deep work cycle",
      cadence: "50 min focus, 10 min break, 15-30 min finish",
      summary: "Use this for heavy reading or difficult topics.",
      steps: [
        "Define the exact section or topic before starting.",
        "Work distraction-free through the first focus block.",
        "Use the final block to summarize and list weak points.",
      ],
    };
  }

  if (durationMinutes >= 45) {
    return {
      name: "Double Pomodoro",
      cadence: "25 min focus, 5 min break, 15-25 min focus",
      summary: "Split medium sessions into two clear pushes.",
      steps: [
        "Use the first block to learn or annotate.",
        "Take a short reset break.",
        "Use the second block to summarize from memory.",
      ],
    };
  }

  if (durationMinutes >= 25) {
    return {
      name: "Pomodoro",
      cadence: "25 min focus, then 5 min break",
      summary: "Best for starting quickly and staying focused.",
      steps: [
        "Pick one concrete outcome.",
        "Focus until the timer ends.",
        "Write a one-line takeaway before taking a break.",
      ],
    };
  }

  return {
    name: "Micro sprint",
    cadence: "10-20 min focused pass",
    summary: "Use short sessions for quick review or cleanup.",
    steps: [
      "Choose one small target.",
      "Work without switching tasks.",
      "Capture the next action before stopping.",
    ],
  };
}

export function getSessionChunks(durationMinutes: number): SessionChunk[] {
  if (durationMinutes >= 75) {
    const remaining = durationMinutes - 50 - 10;
    return [
      { type: "work", minutes: 50, label: "Focus" },
      { type: "break", minutes: 10, label: "Break" },
      { type: "work", minutes: Math.max(remaining, 10), label: "Finish" },
    ];
  }

  if (durationMinutes >= 45) {
    const remaining = durationMinutes - 25 - 5;
    return [
      { type: "work", minutes: 25, label: "Focus" },
      { type: "break", minutes: 5, label: "Break" },
      { type: "work", minutes: Math.max(remaining, 10), label: "Focus" },
    ];
  }

  // Under 45 min: no scheduled breaks
  return [{ type: "work", minutes: durationMinutes, label: "Focus" }];
}

export function getTotalSessionMinutes(durationMinutes: number): number {
  const chunks = getSessionChunks(durationMinutes);
  return chunks.reduce((sum, chunk) => sum + chunk.minutes, 0);
}
