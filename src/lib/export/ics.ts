import type { StudySession, Subject } from "@prisma/client";

function formatIcsDate(date: Date): string {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const seconds = String(d.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function exportSessionsToIcs(
  sessions: (StudySession & { subject: Subject })[],
): string {
  let ics = "BEGIN:VCALENDAR\r\n";
  ics += "VERSION:2.0\r\n";
  ics += "PRODID:-//StudyOS//Study Plan//EN\r\n";
  ics += "CALSCALE:GREGORIAN\r\n";
  ics += "METHOD:PUBLISH\r\n";

  for (const s of sessions) {
    const uid = `${s.id}@studyos`;
    const dtStart = formatIcsDate(s.startsAt);
    const dtEnd = formatIcsDate(s.endsAt);
    const dtStamp = formatIcsDate(new Date());
    const summary = escapeIcs(s.goal || "Study session");
    const description = escapeIcs(
      [
        s.reason || "",
        s.topic ? `Topic: ${s.topic}` : "",
        `Type: ${s.sessionType}`,
        `Status: ${s.status}`,
      ]
        .filter(Boolean)
        .join("\\n"),
    );

    ics += "BEGIN:VEVENT\r\n";
    ics += `UID:${uid}\r\n`;
    ics += `DTSTART:${dtStart}\r\n`;
    ics += `DTEND:${dtEnd}\r\n`;
    ics += `DTSTAMP:${dtStamp}\r\n`;
    ics += `SUMMARY:${summary}\r\n`;
    ics += `DESCRIPTION:${description}\r\n`;
    ics += `STATUS:${s.status === "planned" ? "CONFIRMED" : "CANCELLED"}\r\n`;
    ics += "END:VEVENT\r\n";
  }

  ics += "END:VCALENDAR\r\n";
  return ics;
}
