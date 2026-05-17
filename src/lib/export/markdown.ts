import type { File, FileAiMetadata, StudySession, Subject } from "@prisma/client";

export function exportFileSummary(
  file: File & { subject: Subject; aiMeta: FileAiMetadata | null },
): string {
  const meta = file.aiMeta;

  let md = `# ${file.name}\n\n`;
  md += `**Subject:** ${file.subject.name}\n`;
  md += `**Status:** ${file.processingStatus}\n`;
  md += `**Uploaded:** ${new Date(file.uploadedAt).toLocaleDateString()}\n\n`;

  if (meta) {
    if (meta.summary) {
      md += `## Summary\n\n${meta.summary}\n\n`;
    }

    if (meta.topics && meta.topics.length > 0) {
      md += `## Topics\n\n`;
      for (const topic of meta.topics) {
        md += `- ${topic}\n`;
      }
      md += `\n`;
    }

    if (meta.difficultyScore !== null) {
      md += `**Difficulty:** ${meta.difficultyScore}/10\n`;
    }
    if (meta.estimatedMinutes !== null) {
      md += `**Estimated Study Time:** ${meta.estimatedMinutes} minutes\n`;
    }
  }

  md += `\n---\n\n*Exported from StudyOS*\n`;
  return md;
}

export function exportStudyPlan(
  sessions: (StudySession & { subject: Subject; file: { name: string } | null })[],
): string {
  let md = `# Study Plan\n\n`;
  md += `**Total Sessions:** ${sessions.length}\n`;
  md += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;

  const grouped = new Map<string, typeof sessions>();

  for (const session of sessions) {
    const dateKey = new Date(session.startsAt).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(session);
  }

  for (const [date, daySessions] of grouped) {
    md += `## ${date}\n\n`;

    for (const s of daySessions.sort(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
    )) {
      const start = new Date(s.startsAt).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
      const end = new Date(s.endsAt).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });

      md += `### ${s.goal || "Study session"}\n\n`;
      md += `- **Time:** ${start} - ${end}\n`;
      md += `- **Subject:** ${s.subject.name}\n`;
      md += `- **Duration:** ${s.durationMinutes} min\n`;
      md += `- **Type:** ${s.sessionType}\n`;
      md += `- **Status:** ${s.status}\n`;
      if (s.file) {
        md += `- **Material:** ${s.file.name}\n`;
      }
      if (s.topic) {
        md += `- **Topic:** ${s.topic}\n`;
      }
      if (s.reason) {
        md += `- **Reason:** ${s.reason}\n`;
      }
      md += `\n`;
    }
  }

  md += `---\n\n*Exported from StudyOS*\n`;
  return md;
}
