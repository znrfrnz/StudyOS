# Data Model

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

### users

- `id`
- `email`
- `created_at`

### subjects

- `id`
- `user_id`
- `name`
- `color`
- `priority`
- `archived_at`
- `created_at`

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

### study_plans

- `id`
- `user_id`
- `title`
- `status`
- `created_at`
- `updated_at`

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

## Status Values

File processing status:

- `uploaded`
- `processing`
- `ready`
- `failed`
- `unsupported`

Study session status:

- `planned`
- `completed`
- `missed`
- `skipped`

Study plan status:

- `active`
- `completed`
- `archived`
