# Open Decisions

Resolve these before or during early implementation.

## Product Decisions

- Should quiz generation be included in v0.1 or v0.2?
- Should Markdown export be included in v0.1 or post-MVP?
- What is the minimum useful planner output for the first release?
- Should the first planner generate a fixed 7-day plan or schedule all the way to the deadline?
- Should users define availability once globally or separately per subject?

## Technical Decisions

- Supabase vs Neon for PostgreSQL.
- Supabase Auth vs another auth provider.
- Supabase Storage vs UploadThing.
- OpenAI vs Azure OpenAI.
- Whether v0.1 includes embeddings immediately or starts with summaries only.
- Whether background jobs are required for the first release.
- Which PDF parser to use.
- How to store AI-generated topic lists in PostgreSQL.

## Recommended Defaults

- Use Supabase if you want auth, database, and storage in one place.
- Use PostgreSQL with pgvector only if embeddings are included from the start.
- Start with PDF-only uploads.
- Start with summaries and topic extraction before quizzes.
- Add background jobs once synchronous processing becomes painful.
- Treat scanned PDFs as unsupported until OCR is intentionally added.

## Initial Limits To Decide

- Maximum PDF size.
- Maximum page count.
- Maximum files per user if needed.
- Maximum AI actions per day if needed.
- Maximum generated sessions per plan.
- Maximum session duration.

## Decision Log Template

Use this format when a decision is made:

```md
## YYYY-MM-DD - Decision Title

Decision:

Reason:

Rejected alternatives:

Follow-up:
```
