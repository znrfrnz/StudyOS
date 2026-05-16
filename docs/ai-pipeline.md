# AI Pipeline

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

## Generated Metadata

For each processed file, StudyOS should generate:

- Concise summary.
- Key concepts.
- Important formulas or definitions when present.
- Suggested study duration.
- Difficulty estimate.
- Topic list.

## Failure States

The app should handle:

- Upload failed.
- File too large.
- Text extraction failed.
- PDF contains mostly scanned images.
- AI generation failed.
- Embedding generation failed if embeddings are enabled.
- File deleted during processing.

For v0.1, scanned PDFs can be marked as unsupported unless OCR is intentionally added.

## AI Reliability Rules

- Do not generate summaries from missing or empty text.
- Generated quizzes must be answerable from uploaded material when quiz generation is added.
- AI output should reference source chunks or files when possible.
- AI output should be editable or regeneratable.
- Recommendations should include a short reason.
- The system should prefer saying "not enough information" over hallucinating.

## Cost Controls

- Set a maximum PDF size.
- Set a maximum page count.
- Cache summaries.
- Cache optional embeddings.
- Do not re-embed unchanged files if embeddings are enabled.
- Store AI metadata instead of regenerating it on every page view.
- Use cheaper models for metadata extraction where quality is acceptable.
- Use stronger models only for complex generation if needed.

## Privacy Rules

- Uploaded files are private by default.
- Extracted text is private by default.
- AI-generated summaries are private by default.
- Files sent to AI providers should be limited to required content.
- The app should disclose when content is sent to an external AI provider.
- Deleting a file should delete chunks, summaries, generated metadata, optional embeddings, and quiz data tied only to that file when those features exist.
