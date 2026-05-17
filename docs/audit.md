# StudyOS Codebase Audit

Audit date: 2026-05-17

Scope: codebase, UI/UX, data model, planner behavior, AI/practice flows, privacy, exports, and roadmap coverage against `plan.md`.

## Findings

### Critical: File upload and deadline creation trust client-provided `subjectId`, allowing cross-user subject associations

`uploadAndProcessFile()` accepts `subjectId` directly from `FormData` and creates a `File` with it without checking that the subject belongs to the authenticated user (`src/features/files/actions.ts:21-61`). `createDeadline()` does the same (`src/features/deadlines/actions.ts:46-73`).

The schema allows independent `userId` and `subjectId` fields on `File` and `Deadline` (`prisma/schema.prisma:53-66`, `prisma/schema.prisma:106-116`), so a malicious client could attach their file/deadline to another user's subject ID.

Fix: verify `await prisma.subject.findFirst({ where: { id: subjectId, userId: user.id } })` before creating files or deadlines.

### Critical: Missed sessions are not actually rescheduled in the product loop

Marking a session missed only updates `status` (`src/features/sessions/actions.ts:67-90`). `rescheduleMissedSessions()` exists (`src/features/sessions/actions.ts:195-294`), but it has no callers.

This misses one of the MVP success criteria in `plan.md:75-76` and the adaptive rule in `plan.md:322-324`.

Fix: either call rescheduling when status becomes `missed`, or expose a visible `Reschedule missed sessions` action.

### High: AI metadata failure deletes the original uploaded PDF and leaves a broken failed record

The upload flow stores the PDF, creates a file row, extracts chunks, then calls AI metadata generation (`src/features/files/actions.ts:46-88`). Any error in extraction, chunking, or AI generation falls into one catch block that marks the file `failed`, deletes the storage object, and rethrows (`src/features/files/actions.ts:95-109`).

That means a transient Azure JSON/API error can destroy the user's uploaded material, undermining `plan.md:335-344` and the privacy principle that uploaded files remain user-controlled.

Fix: separate extraction/storage failures from AI failures. Keep the original PDF when AI metadata fails.

### High: Deleting a file does not clean all Phase 4 artifacts tied to that file

`deleteFile()` deletes only the `File` row and relies on cascade behavior (`src/features/files/actions.ts:142-166`). Quizzes cascade through `Quiz.file`, but `Flashcard.file` and `WeakTopicSignal.file` use `onDelete: SetNull` (`prisma/schema.prisma:214-228`, `prisma/schema.prisma:236-249`).

This violates the privacy/data-handling requirement that deleting a file should delete generated data tied only to that file (`plan.md:800-801`).

Fix: if flashcards and weak signals are derived solely from a file, delete them explicitly before deleting the file.

### High: Planner ignores deadline and subject priority despite the roadmap requiring priority weighting

`Subject.priority` and `Deadline.priority` exist (`prisma/schema.prisma:36`, `prisma/schema.prisma:112`), but `generateSchedule()` sorts deadlines only by due date (`src/lib/planner/engine.ts:100-103`) and study units only by file difficulty (`src/lib/planner/engine.ts:157-158`).

This misses the deterministic planner requirement for priority weighting (`plan.md:276-285`) and can produce unrealistic plans for high-priority exams.

Fix: incorporate subject and deadline priority into deadline ordering and session allocation.

### High: Weak-topic review sessions can be scheduled after the relevant deadline

Regular study/review sessions are filtered to slots before each deadline (`src/lib/planner/engine.ts:160-212`), but weak-topic review sessions use `allSlots` without constraining to that topic's subject deadline (`src/lib/planner/engine.ts:242-278`).

A weak topic for an exam tomorrow could be scheduled after that exam if another subject has a later deadline. This conflicts with `plan.md:323-326`.

Fix: find the nearest matching subject deadline for each weak topic and only use availability slots before that deadline.

### High: Missed-session rescheduling can place sessions outside the availability block

The rescheduler finds a block and checks conflicts against `slotStart`/`slotEnd`, but when it creates `foundSlot.endsAt`, it adds the original session duration without verifying that the resulting end time is still before the block end (`src/features/sessions/actions.ts:242-267`).

Long sessions can overflow availability. It also ignores the original deadline despite the comment at `src/features/sessions/actions.ts:198`.

Fix: ensure `slotStart + duration <= slotEnd`, and reschedule only before the relevant deadline when possible.

### Medium: Quiz questions are not traceable to source chunks, weakening AI-grounding guarantees

The plan says AI output should reference source chunks/files when possible (`plan.md:364`) and quiz questions should be grounded in file content (`plan.md:724`). `QuizQuestion` stores question/options/correct answer/explanation/topic, but no source chunk or quote (`prisma/schema.prisma:183-190`). `generateQuiz()` combines all chunks into one string and stores AI output without source references (`src/features/quizzes/actions.ts:79-102`).

This makes later review/debugging hard when AI creates a questionable quiz item.

Fix: include source chunk IDs or short source excerpts in generated quiz questions.

### Medium: `.ics` export may import completed/skipped/missed sessions as canceled calendar events

Export actions include every session regardless of status (`src/features/export/actions.ts:35-53`). `exportSessionsToIcs()` maps anything not `planned` to `STATUS:CANCELLED` (`src/lib/export/ics.ts:53-56`).

Many calendar apps hide or remove canceled events, so exported plans may look incomplete.

Fix: include planned sessions by default, or export completed/missed as normal events with status in the description.

### Medium: AI actions have no rate limiting, caching, or duplicate prevention

`generateQuiz()` creates a new quiz every click (`src/features/quizzes/actions.ts:63-112`), and `generateFlashcardsForFile()` creates another batch every click (`src/features/flashcards/actions.ts:44-83`).

This conflicts with cost-control guidance in `plan.md:817-823`.

Fix: disable duplicate generation while pending, reuse existing quiz/flashcard sets, or add per-file daily limits.

### Medium: Mobile dashboard may overflow or feel cramped for the core mobile action

The dashboard renders today's session row as a horizontal flex with the full `SessionStatusButtons` group on the right (`src/app/(dashboard)/dashboard/page.tsx:70-96`). `SessionStatusButtons` is a non-wrapping row of three pill buttons (`src/features/sessions/components/session-status-buttons.tsx:18-46`).

On narrow screens this risks crowding/overflow, exactly where the plan prioritizes checking today's plan and marking status (`plan.md:590-596`).

Fix: stack action buttons below the session text on mobile.

### Medium: Mobile navigation exposes the full desktop IA instead of the plan's mobile priorities

Mobile nav renders all eight routes in a horizontal scroller (`src/components/layout/nav.tsx:20-28`, `src/components/layout/nav.tsx:77-82`). `plan.md:590-599` says mobile should focus on today's plan, updating session status, summaries, and deadlines, not every desktop management action.

Fix: use a shorter mobile nav: Dashboard, Sessions, Subjects, Deadlines. Keep other actions inside pages.

### Medium: Dashboard is missing recent files and real progress/streak signals from the MVP dashboard spec

The dashboard shows Today, Subjects, Deadlines, Weak topics, and Quick actions (`src/app/(dashboard)/dashboard/page.tsx:38-270`), but `plan.md:260-266` calls for recent files and current study streak or weekly progress.

The Sessions page has a local progress card, but the dashboard itself does not clearly show weekly progress.

Fix: add recent files and a simple weekly progress counter to the dashboard.

### Low: The data model docs are stale relative to the actual Prisma schema

`docs/data-model.md` still documents `study_plans` and `study_sessions.study_plan_id` (`docs/data-model.md:109-122`), but the current Prisma schema has no `StudyPlan` model and `StudySession` links directly to `userId`/`subjectId`/`fileId` (`prisma/schema.prisma:137-160`).

This is acceptable as an implementation simplification, but docs should either be updated or the schema should be brought back in line.

### Low: Code hygiene gaps are being hidden by TypeScript config

`noUnusedLocals`/`noUnusedParameters` are not enabled (`tsconfig.json:2-24`), and there are unused imports such as `redirect`/`uuidv4` in quiz actions (`src/features/quizzes/actions.ts:3-5`) and `notFound`/`ArrowLeft`/`RotateCcw` in the flashcards page (`src/app/(dashboard)/flashcards/page.tsx:1-3`).

Not user-facing, but it will accumulate fast in a feature-heavy app.

Fix: enable unused checks or periodically clean unused imports.

## Plan Coverage

- Phase 1 is broadly covered: auth, protected dashboard shell, subjects CRUD.
- Phase 2 is mostly covered: PDF upload, text extraction, chunks, AI metadata, processing states, deletion of core file data.
- Phase 3 is partially covered: deadlines, availability, plan generation, sessions, status updates exist, but missed-session rescheduling is not connected and planner priority/deadline behavior is incomplete.
- Phase 4 is partially covered: quiz generation, attempts, weak topic signals, flashcards exist, but quiz grounding lacks source references and weak-topic scheduling can miss deadlines.
- Phase 5 is partially covered: Markdown export and `.ics` export exist, active nav polish exists, but notifications/PWA were intentionally skipped and exports need status filtering.

## Verification

- `bun run typecheck` passed after rerun.
- `bun run build` passed.
- No automated tests exist for the planner, upload failure states, quiz scoring, or rescheduling despite those being explicitly listed in `plan.md:751-786`.

## Recommended Fix Order

1. Add subject ownership checks in file upload and deadline creation.
2. Wire missed-session rescheduling into status updates or expose it in the UI.
3. Split file processing failure handling so AI failures do not delete uploaded PDFs.
4. Fix planner deadline/priority/weak-topic scheduling rules.
5. Add cleanup for file-derived flashcards and weak topic signals on file delete.
6. Add planner tests for deadline bounds, availability bounds, overlapping sessions, priority weighting, and missed-session rescheduling.
7. Tighten mobile dashboard/session actions and reduce mobile nav scope.
