# StudyOS

A study planner that turns uploaded learning materials, deadlines, and availability into a focused, realistic study plan students can actually follow.

## Overview

StudyOS addresses a common student problem: vague study goals without a concrete plan. Instead of tracking time or building generic schedules, it connects real inputs to real outputs:

1. **Upload PDFs** — the system extracts topics, estimates difficulty, and calculates reading time
2. **Set deadlines** — exam dates, assignment due dates, or any milestones
3. **Define availability** — recurring study hours that reflect your actual schedule
4. **Generate a plan** — the engine schedules focused sessions that fit your blocks, distribute work across deadlines, and adapt to material difficulty

Each study session comes with a recommended study technique based on session length and type, including built-in break intervals for longer blocks.

## Key Features

- **PDF Processing** — Upload study material PDFs. AI extracts summaries, topics, difficulty scores, and estimated reading time
- **Deadline Calendar** — Interactive monthly calendar with quick-add popovers. Deadlines are grouped by subject and tracked visually
- **Study Plan Generator** — Schedules sessions across your availability blocks, prioritizing by deadline proximity, subject importance, and topic difficulty
- **Study Techniques** — Sessions include technique recommendations:
  - **Pomodoro** (25 min) for focused bursts
  - **Double Pomodoro** (45 min+) with a 5-minute break
  - **Deep Work Cycle** (75 min+) with a 10-minute break
  - **Active Recall Sprint** for review sessions
  - **Practice Loop** for quiz-based study
- **Quizzes & Flashcards** — AI-generated from uploaded PDFs. Quizzes track weak topics and feed back into the planner for targeted review
- **Practice Dashboard** — Subject-based folders where you can review flashcards and take follow-up quizzes from the same material
- **Progress Tracking** — Mark sessions as completed, missed, or skipped. Weekly progress stats and weak topic signals

## Architecture

### App Router (Next.js 16)

The project uses Next.js App Router with the standard `app/` directory structure:

```
src/app/
├── (auth)/          # Route group: login, signup (minimal layout)
├── (dashboard)/     # Route group: all authenticated pages
│   ├── dashboard/   # Main dashboard with sessions, subjects, deadlines, files
│   ├── sessions/    # Study plan with today's and upcoming sessions
│   ├── plan/        # Prerequisites checklist + plan generation
│   ├── deadlines/   # Calendar + quick-add + deadline list
│   ├── subjects/    # Subject cards with file count + subject detail with upload
│   ├── practice/    # Subject folders with flashcards and quizzes
│   ├── quizzes/     # Quiz-taking interface
│   ├── files/       # File detail view
│   └── layout.tsx   # Dashboard sidebar layout
├── page.tsx         # Landing page
├── layout.tsx       # Root layout with Geist font
└── globals.css      # Tailwind CSS custom utilities
```

### Feature-Based Organization

Business logic lives in `src/features/` — each domain owns its own actions, components, and API surface:

```
src/features/
├── subjects/        # CRUD, icon picker, color presets
├── files/           # Upload, PDF parsing, AI metadata extraction
├── deadlines/       # CRUD, calendar component
├── sessions/        # Plan generation, session status management
├── quizzes/         # AI quiz generation, attempts, weak topic tracking
├── flashcards/      # AI flashcard generation, mastery tracking
├── practice/        # Unified practice surface with file picker
├── availability/    # Recurring time blocks
├── export/          # Markdown and ICS export
├── auth/            # Supabase auth helpers
└── ai/              # OpenAI prompts and PDF parsing
```

### Planner Engine

`src/lib/planner/engine.ts` is the scheduling brain:

1. **Expand availability blocks** into concrete time slots from today through the furthest deadline
2. **Sort deadlines** by urgency (days remaining × priority × subject importance)
3. **Reserve weak topic reviews** first — 25-minute review sessions for quiz topics with high incorrect counts
4. **Split materials into study units** after dividing files among topics and estimating per-topic minutes from AI metadata
5. **Fit units into slots** using common focus blocks (25/50/75 min), accounting for break time in the duration calculation
6. **Add reinforcement sessions** for high-difficulty material if leftover time exists
7. **Sort chronologically** and return a flat list of planned sessions

### Data Flow

```
User uploads PDF
    → Supabase Storage (path: userId/subjectId/fileId.pdf)
    → Prisma stores File record with metadata
    → OpenAI extracts topics, difficulty, estimated minutes → FileAiMetadata
    → Planner engine reads metadata when generating schedule

User generates study plan
    → Planner engine reads deadlines, blocks, files, weak topics
    → Engine outputs planned sessions with duration, type, goal, reason
    → Prisma creates StudySession records
    → Dashboard and Sessions pages fetch and display them

User takes quiz
    → Quiz attempt tracked in QuizAttempt
    → WeakTopicSignal updated per topic
    → Next plan generation includes targeted review sessions
```

## Tech Stack

### Core Framework
- **Next.js 16** — App Router, server components, server actions
- **React 19** — UI library
- **TypeScript** — Type safety across the entire codebase
- **Tailwind CSS** — Utility-first styling
- **Geist** — Sans-serif font from Vercel

### Backend & Database
- **Supabase** — Authentication (OAuth) + PostgreSQL storage
- **Prisma ORM** — Type-safe database client with schema-first migrations
- **PostgreSQL** — Relational data store

### AI & Processing
- **OpenAI API** — PDF topic extraction, summary generation, quiz and flashcard creation
- **pdf-parse** — Server-side PDF text extraction

### Deployment & Tooling
- **Turbopack** — Development bundler (Next.js default)
- **Bun** — Package manager
- **PostCSS** — CSS processing with Tailwind

### Key Dependencies
- `@supabase/ssr` + `@supabase/supabase-js` — Auth and database
- `@prisma/client` + `prisma` — Database ORM
- `zod` — Schema validation for server actions
- `lucide-react` — Icon system
- `class-variance-authority` + `clsx` + `tailwind-merge` — Component styling utilities

## Development

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Add DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY

# Generate Prisma client
bunx prisma generate

# Run development server
bun dev

# Type check
bun run typecheck

# Build for production
bun run build
```

## License

Private — All rights reserved.
