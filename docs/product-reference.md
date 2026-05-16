# Product Reference

## Product Thesis

StudyOS helps students reduce the mental overhead of studying by turning real study materials into realistic study plans.

The product should answer one daily question:

> What should I study next, and why?

## Core Loop

1. Upload study material.
2. Extract topics, summaries, and estimated effort.
3. Add deadlines and available study time.
4. Generate a realistic study plan.
5. Complete, miss, or adjust sessions.
6. Adapt the plan based on progress and weak topics.

## Product Principles

- Calm, focused, and lightweight.
- AI-assisted, not AI-dependent.
- Organized without becoming overwhelming.
- Fast enough for daily student use.
- Mobile-friendly for quick checks and session completion.

## MVP Goal

The v0.1 MVP should prove this:

> A student can upload study material, add an exam deadline, receive a useful study plan, and keep that plan updated as they complete or miss sessions.

## MVP User Journey

1. Student creates an account.
2. Student creates a subject.
3. Student uploads a PDF for that subject.
4. StudyOS extracts text from the PDF.
5. StudyOS generates a summary, key topics, estimated difficulty, and estimated study duration.
6. Student adds an exam or deadline.
7. Student enters weekly availability.
8. StudyOS generates a 7-day or deadline-based study plan.
9. Student sees today's sessions on the dashboard.
10. Student marks sessions as completed, missed, or skipped.
11. StudyOS adjusts future sessions when progress changes.

## MVP Success Criteria

- A user can upload a PDF and receive a usable summary within 60 seconds for normal-sized files.
- A user can generate a study plan from at least one subject, one uploaded file, one deadline, and one availability block.
- Every generated study session links back to a source file or topic.
- A user can mark a study session complete or missed.
- Missed sessions can be rescheduled into future available time.
- The dashboard clearly shows today's study plan, upcoming deadlines, and current progress.
- The mobile layout supports checking today's plan and updating session status.
- Deleting a file removes extracted chunks, generated AI metadata, and embeddings if embeddings are enabled.
