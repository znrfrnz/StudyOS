# Technical Architecture

## Package Manager

- Bun.
- Use `bun install` for dependency installation.
- Use `bun run dev`, `bun run typecheck`, and `bun run build` for local workflows.
- Keep `bun.lock` committed.
- Do not add `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`.

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
- pgvector only if embeddings are enabled.

Possible providers:

- Supabase.
- Neon.

## File Storage

Preferred options:

1. Supabase Storage if using Supabase for database and auth.
2. UploadThing if keeping storage separate.

## AI Providers

Preferred options:

1. OpenAI API.
2. Azure OpenAI.

Provider-specific calls should be isolated behind a small server-side AI module so models can be changed later without rewriting product features.

## Suggested App Structure

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

## Integration Boundaries

Calendar:

- Store sessions internally for v0.1.
- Show today and this week inside StudyOS.
- Add `.ics` export later.
- Add Google Calendar sync after the planner proves useful.

Obsidian:

- Start with Markdown export only.
- Avoid bidirectional sync in v0.1.
- Avoid plugin development in v0.1.

Mobile:

- Use responsive web first.
- Prioritize checking today's plan, marking sessions, opening summaries, and viewing deadlines.
- Do not start native mobile in v0.1.
