# Planner Rules

## Planner Strategy

The planner should be hybrid, not fully AI-driven.

Deterministic logic should handle:

- Dates.
- Availability windows.
- Session placement.
- Session duration limits.
- Deadline proximity.
- Missed-session rescheduling.
- Priority weighting.

AI should handle:

- Topic extraction.
- Summary generation.
- Difficulty estimation.
- Study duration estimation.
- Practice recommendations.
- Explanation text.

This keeps planning predictable, cheaper, and easier to debug.

## Planner Inputs

- User availability.
- Exam or deadline dates.
- Subject priorities.
- Uploaded files.
- Extracted topics.
- Estimated file difficulty.
- Estimated study duration.
- Completed sessions.
- Missed sessions.
- Quiz performance when quiz generation is added.

## Planner Outputs

- Study sessions.
- Session duration.
- Linked source file or topic.
- Session goal.
- Session type.
- Reason for scheduling.
- Rescheduling recommendations.

## Session Types For v0.1

- `learn`
- `review`
- `practice`

Quiz sessions can be added after quiz generation exists.

## Adaptive Rules For v0.1

- If a session is completed, mark the linked topic as progressed.
- If a session is missed, move it to the next available slot before the deadline.
- If there is not enough time before a deadline, prioritize high-difficulty and high-priority topics.
- If a user repeatedly misses sessions, shorten future sessions where possible.
- If the user finishes early, offer optional practice instead of automatically expanding the plan.
- When quizzes are added, poor quiz performance should add review sessions before new material when there is available time.

## Session Example

```md
Tuesday, 4:00 PM - 5:30 PM
Subject: Calculus
Material: Chapter 3 PDF
Goal: Review derivatives and complete practice problems
Reason: Exam is in 6 days and this topic has high estimated difficulty
```

## Planner Tests

- Generates sessions before a deadline.
- Respects availability blocks.
- Avoids overlapping sessions.
- Prioritizes closer deadlines.
- Prioritizes higher-difficulty topics when time is limited.
- Handles no available time.
- Handles insufficient time before deadline.
- Reschedules missed sessions when future time exists.
