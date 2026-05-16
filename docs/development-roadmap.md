# Development Roadmap

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

## Testing Checklist

- Auth-protected routes.
- Subject creation and update.
- PDF upload success.
- PDF upload failure.
- File processing status changes.
- Study plan generation.
- Session completion.
- Missed-session rescheduling.
- File deletion cleanup.
- Dashboard desktop layout.
- Dashboard mobile layout.
- Empty states.
- Loading states.
