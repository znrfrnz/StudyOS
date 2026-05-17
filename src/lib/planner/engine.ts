import type { Subject, Deadline, AvailabilityBlock, File, FileAiMetadata, WeakTopicSignal } from "@prisma/client";
import { getTotalSessionMinutes } from "@/lib/study-methods";

export interface ScheduleInput {
  userId: string;
  subjects: Subject[];
  deadlines: (Deadline & { subject: Subject })[];
  blocks: AvailabilityBlock[];
  files: (File & { aiMeta: FileAiMetadata | null; subject: Subject })[];
  weakTopics?: WeakTopicSignal[];
}

export interface PlannedSession {
  userId: string;
  subjectId: string;
  fileId: string | null;
  topic: string | null;
  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;
  sessionType: string;
  goal: string;
  reason: string;
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(":").map(Number);
  return { hours: h, minutes: m };
}

function getSlotEnd(start: Date, durationMinutes: number): Date {
  return new Date(start.getTime() + durationMinutes * 60000);
}

function getMinutesBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

/**
 * Generate concrete time slots from recurring availability blocks.
 * Returns slots sorted chronologically from today up to maxDate.
 */
function expandAvailabilityBlocks(
  blocks: AvailabilityBlock[],
  fromDate: Date,
  maxDate: Date,
): { start: Date; end: Date; maxSessionMinutes: number }[] {
  const slots: { start: Date; end: Date; maxSessionMinutes: number }[] = [];
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);

  // Expand up to maxDate + 1 day to catch edge cases
  const limit = new Date(maxDate);
  limit.setDate(limit.getDate() + 1);

  while (cursor <= limit) {
    const dayOfWeek = cursor.getDay();
    const dayBlocks = blocks.filter((b) => b.dayOfWeek === dayOfWeek);

    for (const block of dayBlocks) {
      const { hours: sh, minutes: sm } = parseTime(block.startTime);
      const { hours: eh, minutes: em } = parseTime(block.endTime);

      const slotStart = new Date(cursor);
      slotStart.setHours(sh, sm, 0, 0);

      const slotEnd = new Date(cursor);
      slotEnd.setHours(eh, em, 0, 0);

      // Skip slots entirely in the past
      if (slotEnd <= fromDate) continue;

      // Clamp start to fromDate if slot starts before
      const effectiveStart = slotStart < fromDate ? new Date(fromDate) : slotStart;

      slots.push({
        start: effectiveStart,
        end: slotEnd,
        maxSessionMinutes: block.maxSessionMinutes,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Generate a study schedule from deadlines, availability, and files.
 */
export function generateSchedule(input: ScheduleInput): PlannedSession[] {
  const { userId, deadlines, blocks, files, weakTopics = [] } = input;

  if (deadlines.length === 0 || blocks.length === 0) {
    return [];
  }

  const now = new Date();

  const subjectPriority = new Map(
    input.subjects.map((subject) => [subject.id, subject.priority]),
  );

  const sortedDeadlines = [...deadlines].sort(
    (a, b) => {
      const aDays = Math.max(0, Math.ceil((a.dueAt.getTime() - now.getTime()) / 86400000));
      const bDays = Math.max(0, Math.ceil((b.dueAt.getTime() - now.getTime()) / 86400000));
      const aScore = aDays * 10 - a.priority * 2 - (subjectPriority.get(a.subjectId) || 0);
      const bScore = bDays * 10 - b.priority * 2 - (subjectPriority.get(b.subjectId) || 0);
      return aScore - bScore;
    },
  );

  const maxDate = deadlines.reduce(
    (latest, deadline) => deadline.dueAt > latest ? deadline.dueAt : latest,
    deadlines[0].dueAt,
  );
  const allSlots = expandAvailabilityBlocks(blocks, now, maxDate);

  if (allSlots.length === 0) {
    return [];
  }

  const sessions: PlannedSession[] = [];
  const slotUsage = new Map<number, number>(); // slotIndex -> used minutes

  const significantWeakTopics = weakTopics
    .filter((wt) => wt.incorrectCount > 0)
    .sort((a, b) => b.incorrectCount - a.incorrectCount)
    .slice(0, 5);

  // Put quiz-derived weak-topic reviews first when possible.
  for (const weakTopic of significantWeakTopics) {
    const subject = input.subjects.find((s) => s.id === weakTopic.subjectId);
    const file = files.find((f) => f.id === weakTopic.fileId);
    const deadline = sortedDeadlines.find(
      (d) => d.subjectId === weakTopic.subjectId && d.dueAt > now,
    );

    if (!subject || !deadline) continue;

    const deadlineSlots = allSlots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.end <= deadline.dueAt);

    for (const { slot, index: slotIndex } of deadlineSlots) {
      const used = slotUsage.get(slotIndex) || 0;
      const available = getMinutesBetween(slot.start, slot.end) - used;

      if (available >= 25) {
        const sessionStart = new Date(slot.start.getTime() + used * 60000);
        sessions.push({
          userId,
          subjectId: subject.id,
          fileId: file?.id || null,
          topic: weakTopic.topic,
          startsAt: sessionStart,
          endsAt: getSlotEnd(sessionStart, 25),
          durationMinutes: 25,
          sessionType: "review",
          goal: `Review weak topic: ${weakTopic.topic}`,
          reason: `Quiz performance shows this topic needs reinforcement (${weakTopic.incorrectCount} incorrect)`,
        });

        slotUsage.set(slotIndex, used + getTotalSessionMinutes(25));
        break;
      }
    }
  }

  // For each deadline, determine what needs to be studied
  for (const deadline of sortedDeadlines) {
    const subjectFiles = files.filter(
      (f) => f.subjectId === deadline.subjectId,
    );

    if (subjectFiles.length === 0) continue;

    // Build a list of material units to schedule
    // Each unit is a chunk of study material
    type StudyUnit = {
      fileId: string;
      topic: string;
      remainingMinutes: number;
      difficultyScore: number;
      fileName: string;
    };

    const units: StudyUnit[] = [];

    for (const file of subjectFiles) {
      const totalMinutes = file.aiMeta?.estimatedMinutes || 30;
      const difficulty = file.aiMeta?.difficultyScore || 5;
      const topics =
        file.aiMeta?.topics && file.aiMeta.topics.length > 0
          ? file.aiMeta.topics
          : [file.name];

      // Split total time across topics
      const minutesPerTopic = Math.max(20, Math.ceil(totalMinutes / topics.length));

      for (const topic of topics) {
        units.push({
          fileId: file.id,
          topic,
          remainingMinutes: minutesPerTopic,
          difficultyScore: difficulty,
          fileName: file.name,
        });
      }
    }

    // Sort units by difficulty (higher first) so harder topics get scheduled first
    units.sort((a, b) => b.difficultyScore - a.difficultyScore);

    // Find slots before this deadline
    const deadlineSlots = allSlots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.end <= deadline.dueAt);

    for (const unit of units) {
      let remaining = unit.remainingMinutes;

      for (const { slot, index: slotIndex } of deadlineSlots) {
        if (remaining <= 0) break;

        const used = slotUsage.get(slotIndex) || 0;
        const available = getMinutesBetween(slot.start, slot.end) - used;

        if (available <= 0) continue;

        // Prefer common focus blocks over arbitrary lengths.
        const maxSession = Math.min(slot.maxSessionMinutes, 90); // cap at 90 min for focus
        const rawSessionLength = Math.min(remaining, available, maxSession);
        const sessionLength = rawSessionLength >= 75
          ? 75
          : rawSessionLength >= 50
            ? 50
            : rawSessionLength >= 25
              ? 25
              : rawSessionLength;

        if (sessionLength < 15) continue; // Too short to be useful

        const sessionStart = new Date(slot.start.getTime() + used * 60000);
        const totalMinutes = getTotalSessionMinutes(sessionLength);
        const sessionEnd = getSlotEnd(sessionStart, totalMinutes);

        sessions.push({
          userId,
          subjectId: deadline.subjectId,
          fileId: unit.fileId,
          topic: unit.topic,
          startsAt: sessionStart,
          endsAt: sessionEnd,
          durationMinutes: totalMinutes,
          sessionType: "learn",
          goal: `Study ${unit.topic} from ${unit.fileName}`,
          reason: `Deadline "${deadline.title}" is on ${deadline.dueAt.toLocaleDateString()}${unit.difficultyScore >= 7 ? " and this topic has high estimated difficulty" : ""}`,
        });

        slotUsage.set(slotIndex, used + totalMinutes);
        remaining -= sessionLength;
      }
    }
  }

  // Add a few review sessions for high-difficulty topics if there is leftover time
  const highDifficultyFiles = files.filter(
    (f) => (f.aiMeta?.difficultyScore || 0) >= 7,
  );

  for (const file of highDifficultyFiles.slice(0, 3)) {
    const topics = file.aiMeta?.topics?.slice(0, 2) || [file.name];
    const deadline = sortedDeadlines.find((d) => d.subjectId === file.subjectId);
    if (!deadline) continue;

    // Find first slot with at least 30 min free before the deadline
    const deadlineSlots = allSlots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.end <= deadline.dueAt);

    for (const topic of topics) {
      for (const { slot, index: slotIndex } of deadlineSlots) {
        const used = slotUsage.get(slotIndex) || 0;
        const available = getMinutesBetween(slot.start, slot.end) - used;

        if (available >= 25) {
          const sessionStart = new Date(slot.start.getTime() + used * 60000);
          sessions.push({
            userId,
            subjectId: file.subjectId,
            fileId: file.id,
            topic,
            startsAt: sessionStart,
            endsAt: getSlotEnd(sessionStart, 25),
            durationMinutes: 25,
            sessionType: "review",
            goal: `Review ${topic}`,
            reason: `High-difficulty material needs reinforcement before "${deadline.title}"`,
          });

          slotUsage.set(slotIndex, used + getTotalSessionMinutes(25));
          break;
        }
      }
    }
  }

  // Sort all sessions chronologically
  sessions.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return sessions;
}
