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
study_sessions
quizzes
quiz_questions
quiz_attempts
weak_topic_signals
flashcards
```

## Post-MVP Tables

```md
tasks
quiz_attempt_details
calendar_integrations
notifications
```

## Key Relationships

- A user has many subjects.
- A subject has many files.
- A file has many file chunks.
- A file has one AI metadata record.
- A subject has many deadlines.
- A user has many availability blocks.
- A study session can link to a subject, file, or topic.
- A quiz belongs to a file or topic when quiz generation is added.
- A quiz attempt belongs to a quiz and user when quiz attempts are added.
- Weak topic signals belong to a user and can link back to a subject and file.
- Flashcards belong to a user and subject, and may link back to a file.

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
- `archived`
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

### study_sessions

- `id`
- `user_id`
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

### quizzes

- `id`
- `user_id`
- `subject_id`
- `file_id`
- `title`
- `status`
- `created_at`

### quiz_questions

- `id`
- `quiz_id`
- `question`
- `options`
- `correct_answer`
- `explanation`
- `source_excerpt`
- `topic`

### quiz_attempts

- `id`
- `quiz_id`
- `user_id`
- `score`
- `answers`
- `created_at`

### weak_topic_signals

- `id`
- `user_id`
- `subject_id`
- `file_id`
- `topic`
- `incorrect_count`
- `total_attempts`
- `last_encountered_at`

### flashcards

- `id`
- `user_id`
- `subject_id`
- `file_id`
- `front`
- `back`
- `mastery_level`
- `last_reviewed_at`

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

Quiz status:

- `ready`
- `archived`
