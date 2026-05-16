# StudyOS

AI-powered study operating system for turning learning materials into realistic study plans.

Version: v0.1 roadmap  
Author: Franz Emmanuel Baes  
Status: Implementation planning

---

# 1. Product Thesis

StudyOS helps students reduce the mental overhead of studying.

The core product loop is:

1. Upload study material.
2. Extract topics, summaries, and estimated effort.
3. Add deadlines and available study time.
4. Generate a realistic study plan.
5. Complete, miss, or adjust sessions.
6. Adapt the plan based on progress and weak topics.

StudyOS should not be a generic productivity suite with AI features attached. Its main differentiator is that the study plan is grounded in the student's actual uploaded materials.

---

# 2. Product Principles

StudyOS should feel:

- Calm, focused, and lightweight.
- AI-assisted, not AI-dependent.
- Organized without becoming overwhelming.
- Fast enough for daily student use.
- Useful on mobile for quick checks and session completion.

AI should enhance the workflow quietly. The student should always understand what is scheduled, why it was scheduled, and what material it came from.

---

# 3. MVP Goal

The v0.1 MVP should prove one thing:

> A student can upload study material, add an exam deadline, receive a useful study plan, and keep that plan updated as they complete or miss sessions.

The MVP should optimize for this loop before adding broad productivity features.

---

# 4. MVP User Journey

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

---

# 5. MVP Success Criteria

v0.1 is successful when:

- A user can upload a PDF and receive a usable summary within 60 seconds for normal-sized files.
- A user can generate a study plan from at least one subject, one uploaded file, one deadline, and one availability block.
- Every generated study session links back to a source file or topic.
- A user can mark a study session complete or missed.
- Missed sessions can be rescheduled into future available time.
- The dashboard clearly shows today's study plan, upcoming deadlines, and current progress.
- The mobile layout supports checking today's plan and updating session status.
- Deleting a file removes its extracted chunks, generated AI metadata, and embeddings if embeddings are enabled.

---

# 6. MVP Scope

## Must Have

- Authentication.
- Subjects.
- PDF upload.
- File text extraction.
- File chunking.
- AI summaries.
- AI key topic extraction.
- Estimated difficulty and study duration.
- Exam/deadline input.
- Weekly availability input.
- Basic generated study plan.
- Study sessions linked to topics/files.
- Session statuses: planned, completed, missed, skipped.
- Basic adaptive rescheduling.
- Dashboard with today's plan, upcoming deadlines, and recent files.

## Should Have

- Quiz generation from uploaded material.
- Weak topic tracking from quiz results.
- Simple flashcards.
- Markdown export for summaries and study plans.
- Email or in-app reminders.

## Later

- Google Calendar sync.
- Apple Calendar or CalDAV sync.
- Obsidian plugin.
- Native mobile app.
- Lecture transcription.
- Voice assistant.
- Collaboration.
- Gamification.
- LMS integrations.

---

# 7. Non-Goals For v0.1

The MVP should not include:

- Full productivity-suite task management.
- Full monthly calendar replacement.
- Drag-and-drop calendar editing.
- Bidirectional Obsidian sync.
- Obsidian plugin development.
- Native iOS or Android app.
- Real-time collaboration.
- Complex gamification.
- Institution or classroom management.
- AI tutor chat as a primary interface.
- Support for every document type.

These can be added later if the core study-planning loop proves useful.

---

# 8. Core Features

## 8.1 Subjects

Subjects organize uploaded files, deadlines, and study plans.

Each subject should store:

- Name.
- Color or icon.
- Priority level.
- Created date.
- Archived status.

## 8.2 File Management

v0.1 should support PDF uploads only.

Each file should store:

- File name.
- Subject.
- Upload date.
- Storage path.
- Processing status.
- Extracted text status.
- Estimated study duration.
- Difficulty score.
- AI-generated topics.
- Last reviewed date.

Supported file actions for v0.1:

- View summary.
- View key topics.
- Add to study plan.
- Mark as reviewed.
- Delete file and related AI data.

Later file actions:

- Generate notes.
- Quiz me.
- Generate flashcards.
- Favorite.
- Tag.
- Recently opened.

## 8.3 AI Summaries

For each processed file, StudyOS should generate:

- Concise summary.
- Key concepts.
- Important formulas or definitions when present.
- Suggested study duration.
- Difficulty estimate.
- Topic list.

AI summaries should be grounded in the uploaded content. If the content is too short, corrupted, scanned without OCR, or low quality, the system should say that instead of inventing details.

## 8.4 Deadlines And Exams

Each exam or deadline should store:

- Subject.
- Title.
- Date and time.
- Priority.
- Target files or topics.
- Current readiness score if available.

## 8.5 Availability

Users need a simple way to define when they can study.

v0.1 availability model:

- Day of week.
- Start time.
- End time.
- Optional subject preference.
- Maximum session length.

Avoid building a full calendar system in v0.1. Availability is only used to place study sessions.

## 8.6 Study Plans

A study plan is generated from deadlines, files, topics, available time, and progress.

Each plan should contain study sessions with:

- Subject.
- Linked file or topic.
- Date and time.
- Duration.
- Session type: learn, review, practice.
- Goal.
- Status: planned, completed, missed, skipped.
- Source reason.

Example session:

```md
Tuesday, 4:00 PM - 5:30 PM
Subject: Calculus
Material: Chapter 3 PDF
Goal: Review derivatives and complete practice problems
Reason: Exam is in 6 days and this topic has high estimated difficulty
```

## 8.7 Dashboard

The dashboard should prioritize immediate action.

v0.1 dashboard widgets:

- Today's study sessions.
- Upcoming exams and deadlines.
- Current study streak or weekly progress.
- Recently uploaded files.
- Weak topics if quiz data exists.

The dashboard should not become a dense analytics screen in v0.1.

---

# 9. Planner Behavior

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
- Exam/deadline dates.
- Subject priorities.
- Uploaded files.
- Extracted topics.
- Estimated file difficulty.
- Estimated study duration.
- Completed sessions.
- Missed sessions.
- Quiz performance when available.

## Planner Outputs

- Study sessions.
- Session duration.
- Linked source file or topic.
- Session goal.
- Session type.
- Reason for scheduling.
- Rescheduling recommendations.

## Adaptive Rules For v0.1

- If a session is completed, mark the linked topic as progressed.
- If a session is missed, move it to the next available slot before the deadline.
- If there is not enough time before a deadline, prioritize high-difficulty and high-priority topics.
- If a user repeatedly misses sessions, shorten future sessions where possible.
- When quizzes are added, poor quiz performance should add review sessions before new material when there is available time.
- If the user finishes early, offer optional practice instead of automatically expanding the plan.

---

# 10. AI Pipeline

## File Upload Flow

1. User uploads PDF.
2. Store original file.
3. Create file record with `processing` status.
4. Extract text.
5. Split text into chunks.
6. Optionally generate embeddings if semantic search or RAG is enabled.
7. Store chunks and optional embeddings.
8. Generate summary, key topics, duration estimate, and difficulty estimate.
9. Mark file as `ready`.
10. Enable planning actions.

## Failure States

The app should handle:

- Upload failed.
- File too large.
- Text extraction failed.
- PDF contains mostly scanned images.
- AI generation failed.
- Embedding generation failed.
- File deleted during processing.

For v0.1, scanned PDFs can be marked as unsupported unless OCR is intentionally added.

## AI Reliability Rules

- Do not generate summaries from missing or empty text.
- Generated quizzes must be answerable from uploaded material when quiz generation is added.
- AI output should reference source chunks or files when possible.
- AI output should be editable or regeneratable.
- Recommendations should include a short reason.
- The system should prefer saying "not enough information" over hallucinating.

---

# 11. Data Model

## MVP Tables

```md
users
subjects
files
file_chunks
file_ai_metadata
deadlines
availability_blocks
study_plans
study_sessions
```

## Post-MVP Tables

```md
tasks
quizzes
quiz_questions
quiz_attempts
flashcards
```

## Key Relationships

- A user has many subjects.
- A subject has many files.
- A file has many file chunks.
- A file has one AI metadata record.
- A subject has many deadlines.
- A user has many availability blocks.
- A study plan belongs to a user and can target one or more deadlines.
- A study plan has many study sessions.
- A study session can link to a subject, file, or topic.
- A quiz belongs to a file or topic when quiz generation is added.
- A quiz attempt belongs to a quiz and user when quiz attempts are added.

## Important Fields

### files

- `id`
- `user_id`
- `subject_id`
- `name`
- `storage_path`
- `mime_type`
- `size_bytes`
- `processing_status`
- `uploaded_at`
- `last_reviewed_at`

### file_chunks

- `id`
- `file_id`
- `chunk_index`
- `content`
- `embedding` if embeddings are enabled
- `page_number`

### file_ai_metadata

- `id`
- `file_id`
- `summary`
- `topics`
- `difficulty_score`
- `estimated_minutes`
- `generated_at`

### deadlines

- `id`
- `user_id`
- `subject_id`
- `title`
- `due_at`
- `priority`

### availability_blocks

- `id`
- `user_id`
- `day_of_week`
- `start_time`
- `end_time`
- `max_session_minutes`

### study_sessions

- `id`
- `study_plan_id`
- `subject_id`
- `file_id`
- `topic`
- `starts_at`
- `ends_at`
- `duration_minutes`
- `session_type`
- `status`
- `goal`
- `reason`

---

# 12. Tech Stack

## Package Manager

- Bun.
- Use `bun install` for dependency installation.
- Use `bun run dev`, `bun run typecheck`, and `bun run build` for local workflows.
- Keep `bun.lock` committed.
- Do not add npm, pnpm, or Yarn lockfiles.

## Frontend

- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.

## Backend

- Next.js Server Actions for form mutations where practical.
- API routes for file processing, AI actions, and webhooks.
- Background jobs for file processing if synchronous processing becomes slow.

## Database

- PostgreSQL.
- Prisma ORM.
- pgvector if embeddings are enabled.

Possible providers:

- Supabase.
- Neon.

## File Storage

Preferred options:

1. Supabase Storage if using Supabase for database/auth.
2. UploadThing if keeping storage separate.

## AI Providers

Preferred options:

1. OpenAI API.
2. Azure OpenAI.

The code should isolate provider-specific calls behind a small server-side AI module so models can be changed later without rewriting app features.

---

# 13. Suggested App Structure

```md
/src
  /app
    /(auth)
    /(dashboard)
    /api
  /components
    /ui
    /layout
  /features
    /auth
    /subjects
    /files
    /deadlines
    /availability
    /planner
    /sessions
    /ai
  /lib
    /db
    /ai
    /storage
    /planner
  /server
  /types
```

Keep feature logic close to the feature folder. Shared infrastructure belongs in `/lib`.

---

# 14. UI/UX Direction

## Design Goals

- Minimal.
- Calm.
- Fast.
- Clear hierarchy.
- Mobile-friendly.
- Notion-like organization without copying Notion.
- Linear-like smoothness without over-animating.

## Primary Screens For v0.1

- Login/signup.
- Dashboard.
- Subjects list.
- Subject detail.
- File upload and processing state.
- File summary view.
- Deadline setup.
- Availability setup.
- Study plan view.
- Today's sessions view.

## Mobile Priorities

Mobile should support:

- Checking today's plan.
- Marking a session complete or missed.
- Opening a summary.
- Reviewing upcoming deadlines.

Do not force the mobile UI to support every desktop management action in v0.1.

---

# 15. Integrations

## Calendar

v0.1 should not build a full calendar replacement.

Initial approach:

- Show today and this week inside StudyOS.
- Store study sessions internally.
- Add `.ics` export later.

Later:

- Google Calendar sync.
- Push reminders.
- CalDAV or Apple Calendar support.

## Obsidian

Recommended first step:

- Export summaries as Markdown.
- Export study plans as Markdown.
- Allow manual import into Obsidian.

Avoid in v0.1:

- Bidirectional vault sync.
- Obsidian plugin.
- Automatic conflict resolution.

Future vault structure:

```md
/ObsidianVault
  /StudyOS
    /Summaries
    /Flashcards
    /StudyPlans
```

---

# 16. Development Phases

## Phase 1 - Core App Foundation

Goal: A user can sign in, create subjects, and use the dashboard shell.

Build:

- Project setup.
- Authentication.
- Database schema foundation.
- Dashboard layout.
- Subjects CRUD.

Verify:

- User can create and view subjects.
- Auth-protected pages reject logged-out users.
- Dashboard loads on desktop and mobile.

## Phase 2 - File Intelligence

Goal: A user can upload a PDF and receive AI-generated study metadata.

Build:

- PDF upload.
- File storage.
- Text extraction.
- Chunking.
- Optional embeddings.
- Summary generation.
- Topic extraction.
- Processing states.

Verify:

- Small PDFs process successfully.
- Failed extraction shows a useful state.
- Generated metadata is saved and visible.
- Deleting a file removes related chunks, metadata, and embeddings if enabled.

## Phase 3 - Study Planner MVP

Goal: A user can generate a study plan from files, deadlines, and availability.

Build:

- Deadline creation.
- Availability blocks.
- Study plan generation.
- Study session creation.
- Today's sessions view.
- Session status updates.
- Basic missed-session rescheduling.

Verify:

- Plan generation creates sessions before the deadline.
- Sessions fit inside availability blocks.
- Sessions link to source files or topics.
- Missed sessions reschedule when time exists.

## Phase 4 - Practice Loop

Goal: StudyOS can identify weak topics and recommend review.

Build:

- Quiz generation.
- Quiz attempts.
- Weak topic detection.
- Review recommendations.
- Optional flashcards.

Verify:

- Quiz questions are grounded in file content.
- Wrong answers update weak topic signals.
- Planner can add review sessions when needed.

## Phase 5 - Polish And Integrations

Goal: Improve daily usability after the core loop works.

Build:

- Markdown export.
- `.ics` export.
- Notifications.
- PWA installability.
- Performance improvements.
- UI polish.

Verify:

- Exported Markdown is usable.
- Exported calendar files open correctly.
- Mobile dashboard remains fast and readable.

---

# 17. Testing And Validation

## Functional Tests

- Auth-protected routes.
- Subject creation and update.
- PDF upload success.
- PDF upload failure.
- File processing status changes.
- Study plan generation.
- Session completion.
- Missed-session rescheduling.
- File deletion cleanup.

## Planner Tests

- Generates sessions before a deadline.
- Respects availability blocks.
- Avoids overlapping sessions.
- Prioritizes closer deadlines.
- Prioritizes higher-difficulty topics when time is limited.
- Handles no available time.
- Handles insufficient time before deadline.

## AI Tests

- Empty text does not generate fake summaries.
- Low-quality extraction returns a clear warning.
- Quiz questions reference uploaded content.
- Summary generation stores output correctly.

## UI Checks

- Dashboard works on desktop.
- Dashboard works on mobile.
- File processing states are visible.
- Empty states explain what to do next.
- Loading states are clear.

---

# 18. Privacy And Data Handling

Study materials may be private, copyrighted, or personally sensitive.

StudyOS should define:

- Uploaded files are private by default.
- Extracted text is private by default.
- AI-generated summaries are private by default.
- Files sent to AI providers should be limited to the required content.
- Users should be able to delete files.
- Deleting a file should delete chunks, summaries, generated metadata, optional embeddings, and quiz data tied only to that file when those features exist.
- The app should disclose when content is sent to an external AI provider.

Future privacy improvements:

- Per-file AI opt-out.
- Local-only processing mode.
- Data export.
- Full account deletion.

---

# 19. Cost Controls

AI and file processing costs should be controlled from the start.

v0.1 limits should include:

- Maximum PDF size.
- Maximum page count.
- Maximum files per user if needed.
- Maximum AI actions per day if needed.
- Caching for summaries and optional embeddings.
- No re-embedding unchanged files if embeddings are enabled.
- Background processing for larger files.

Cost-related implementation notes:

- Generate embeddings once per file version if embeddings are enabled.
- Store AI metadata instead of regenerating it on every page view.
- Use cheaper models for metadata extraction where quality is acceptable.
- Use stronger models only for complex generation if needed.

---

# 20. Risks And Mitigations

## Scope Creep

Risk:

- StudyOS becomes a file manager, task app, calendar app, note app, and chatbot at the same time.

Mitigation:

- Prioritize the upload-to-study-plan loop.
- Keep calendar, Obsidian, native mobile, and collaboration out of v0.1.

## AI Hallucination

Risk:

- Students trust incorrect summaries or quizzes.

Mitigation:

- Ground AI output in uploaded text.
- Add source references where practical.
- Prefer uncertainty over invented answers.

## AI Cost

Risk:

- Large files and repeated AI actions become expensive.

Mitigation:

- Add file limits.
- Cache generated outputs.
- Embed once per file version.

## File Processing Complexity

Risk:

- DOCX, PPTX, scanned PDFs, and OCR slow down MVP development.

Mitigation:

- Support PDF text extraction first.
- Treat OCR as later work.

## Planner Quality

Risk:

- AI-generated plans feel unrealistic or hard to follow.

Mitigation:

- Use deterministic scheduling rules.
- Keep sessions within user availability.
- Explain why each session exists.
- Integrate study techniques.

## Mobile Complexity

Risk:

- Desktop-heavy planning screens are hard to use on mobile.

Mitigation:

- Mobile only needs today's plan, session status updates, summaries, and deadlines in v0.1.

---

# 21. Open Decisions

Before implementation, decide:

- Supabase vs Neon for PostgreSQL.
- Supabase Auth vs another auth provider.
- Supabase Storage vs UploadThing.
- OpenAI vs Azure OpenAI.
- Initial PDF size and page limits.
- Whether v0.1 includes embeddings immediately or starts with summaries only.
- Whether background jobs are required for first release.
- Whether quiz generation belongs in v0.1 or v0.2.

Recommended defaults:

- Use Supabase if you want auth, database, and storage in one place.
- Use PostgreSQL with pgvector only if embeddings are included from the start.
- Start with PDF-only uploads.
- Start with summaries and topic extraction before quizzes.
- Add background jobs once synchronous processing becomes painful.

---

# 22. Final Goal

StudyOS should help students answer one question every day:

> What should I study next, and why?

If v0.1 answers that question reliably using the student's real materials, the product is on the right track.
