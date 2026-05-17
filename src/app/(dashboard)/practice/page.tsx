import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, HelpCircle, Layers, Plus, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";

import {
  deleteFlashcard,
  updateFlashcardMastery,
} from "@/features/flashcards/actions";
import { getPracticePageData } from "@/features/dashboard/queries";
import {
  PracticeFilePicker,
  StartPracticeButton,
} from "@/features/practice/components/practice-file-picker";
import { SubjectIcon } from "@/features/subjects/components/subject-icons";

export const metadata: Metadata = {
  title: "Practice",
};

const masteryLabels = ["New", "Learning", "Familiar", "Proficient", "Mastered", "Expert"];

function PracticeFlashcardItem({
  card,
}: {
  card: Awaited<ReturnType<typeof getPracticePageData>>["flashcards"][0];
}) {
  async function handleMastery(formData: FormData) {
    "use server";
    const delta = Number(formData.get("delta"));
    await updateFlashcardMastery(card.id, delta);
  }

  async function handleDelete() {
    "use server";
    await deleteFlashcard(card.id);
  }

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-3 text-sm">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {masteryLabels[card.masteryLevel] || "New"}
        </span>
        <span className="text-xs text-muted-foreground">
          Mastery {card.masteryLevel}/5
        </span>
      </div>
      <p className="mt-2 break-words font-medium">{card.front}</p>
      <p className="mt-1 break-words text-sm text-muted-foreground">{card.back}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <form action={handleMastery}>
          <input type="hidden" name="delta" value="-1" />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <ThumbsDown className="size-3" />
            Hard
          </button>
        </form>
        <form action={handleMastery}>
          <input type="hidden" name="delta" value="1" />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
          >
            <ThumbsUp className="size-3" />
            Easy
          </button>
        </form>
        <form action={handleDelete}>
          <button
            type="submit"
            aria-label="Delete flashcard"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <Trash2 className="size-3" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function PracticePage({
  searchParams,
}: {
  searchParams?: Promise<{ subjectId?: string; quizId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { subjects, files, quizzes, flashcards } = await getPracticePageData();

  const selectedSubject = subjects.find(
    (subject) => subject.id === resolvedSearchParams.subjectId,
  );

  return (
    <div className="page-shell">
      <div className="content-shell">
        <header className="page-header">
          <div>
            <h1 className="page-title">Practice by subject</h1>
          </div>
          <p className="header-copy">
            Open a subject folder to review generated practice and create more from relevant files.
          </p>
        </header>

        {subjects.length === 0 ? (
          <div className="surface-card py-16 text-center">
            <BookOpen className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-lg font-medium">No subjects yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a subject and upload files before practicing.
            </p>
            <Link href="/plan" className="btn btn-default mt-6 inline-flex items-center gap-2">
              <Plus className="size-4" />
              Start setup
            </Link>
          </div>
        ) : !selectedSubject ? (
          <section className="surface-card" aria-labelledby="choose-subject-title">
            <h2 id="choose-subject-title" className="text-2xl font-semibold">
              Subject folders
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => {
                const subjectFiles = files.filter((file) => file.subjectId === subject.id);
                const subjectQuizzes = quizzes.filter((quiz) => quiz.subjectId === subject.id);
                const subjectFlashcards = flashcards.filter((card) => card.subjectId === subject.id);

                return (
                  <Link
                    key={subject.id}
                    href={`/practice?subjectId=${subject.id}`}
                    className="rounded-2xl border border-border p-4 transition-colors hover:opacity-90"
                    style={{ backgroundColor: subject.color || "var(--muted)" }}
                  >
                    <div className="flex items-center gap-3">
                      <SubjectIcon
                        name={subject.icon}
                        className="size-4"
                        style={{ color: subject.color ? "#000" : undefined }}
                      />
                      <span className="font-semibold text-black/90">{subject.name}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl border border-black/10 bg-white/50 px-2 py-2">
                        <p className="font-semibold text-black/80">{subjectFiles.length}</p>
                        <p className="text-black/50">Files</p>
                      </div>
                      <div className="rounded-xl border border-black/10 bg-white/50 px-2 py-2">
                        <p className="font-semibold text-black/80">{subjectQuizzes.length}</p>
                        <p className="text-black/50">Quizzes</p>
                      </div>
                      <div className="rounded-xl border border-black/10 bg-white/50 px-2 py-2">
                        <p className="font-semibold text-black/80">{subjectFlashcards.length}</p>
                        <p className="text-black/50">Cards</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="surface-card" aria-labelledby="choose-files-title">
            <Link href="/practice" className="mb-5 inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
              Back to folders
            </Link>
            {(() => {
              const subjectFiles = files.filter((file) => file.subjectId === selectedSubject.id);
              const subjectQuizzes = quizzes.filter((quiz) => quiz.subjectId === selectedSubject.id);
               const subjectFlashcards = flashcards.filter((card) => card.subjectId === selectedSubject.id);
               const practiceFiles = subjectFiles.map((file) => ({
                id: file.id,
                name: file.name,
                estimatedMinutes: file.aiMeta?.estimatedMinutes ?? null,
                difficultyScore: file.aiMeta?.difficultyScore ?? null,
              }));

              return (
                <>
                  <div
                    className="mb-6 rounded-2xl border border-border p-5"
                    style={{ backgroundColor: selectedSubject.color || "var(--muted)" }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <SubjectIcon
                            name={selectedSubject.icon}
                            className="size-5"
                            style={{ color: selectedSubject.color ? "#000" : undefined }}
                          />
                          <p className="text-sm font-medium text-black/60">Subject folder</p>
                        </div>
                        <h2 id="choose-files-title" className="mt-1 text-2xl font-semibold text-black/90">
                          {selectedSubject.name}
                        </h2>
                        <p className="mt-1 text-sm text-black/50">
                          Start with flashcards, then take a fresh quiz from the same files.
                        </p>
                      </div>
                      <Link
                        href={`/subjects/${selectedSubject.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-4 py-2 text-sm font-medium text-black/80 transition-colors hover:bg-white/70"
                      >
                        Manage files
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="mb-6 rounded-2xl border border-border bg-primary p-5 text-primary-foreground">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-70">
                      Main action
                    </p>
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold">Start practice</h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 opacity-75">
                          Uses all ready files in this subject by default. You can customize files below if needed.
                        </p>
                      </div>
                      <StartPracticeButton files={practiceFiles} subjectId={selectedSubject.id} />
                    </div>
                  </div>

                  {resolvedSearchParams.quizId && (
                    <div className="mb-6 rounded-2xl border border-border bg-background p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">Finish flashcards, then quiz yourself</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            This quiz was generated from the same files as the flashcards below.
                          </p>
                        </div>
                        <Link
                          href={`/quizzes/${resolvedSearchParams.quizId}`}
                          className="btn btn-default inline-flex items-center gap-2"
                        >
                          Take follow-up quiz
                          <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  <details className="mb-6 rounded-2xl border border-border bg-background p-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Choose specific files instead
                    </summary>
                    <div className="mt-4">
                      <PracticeFilePicker
                        subjectId={selectedSubject.id}
                        files={practiceFiles}
                      />
                    </div>
                  </details>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="min-w-0 rounded-2xl border border-border bg-background p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="inline-flex items-center gap-2 font-semibold">
                          <HelpCircle className="size-4" />
                          Quizzes
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {subjectQuizzes.length} generated
                        </span>
                      </div>
                      {subjectQuizzes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No quizzes generated for this subject yet.
                        </p>
                      ) : (
                        <div className="grid gap-2">
                          {subjectQuizzes.slice(0, 5).map((quiz) => {
                            const latestAttempt = quiz.attempts[0];
                            return (
                              <Link
                                key={quiz.id}
                                href={`/quizzes/${quiz.id}`}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 text-sm transition-colors hover:bg-muted"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate font-medium">{quiz.title}</span>
                                  <span className="mt-1 block text-xs text-muted-foreground">
                                    {quiz.questions.length} questions
                                    {latestAttempt ? ` · Best ${latestAttempt.score}/${quiz.questions.length}` : ""}
                                  </span>
                                </span>
                                <ArrowRight className="size-4 shrink-0" />
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="inline-flex min-w-0 items-center gap-2 font-semibold">
                          <Layers className="size-4" />
                          Flashcards
                        </h3>
                        <span className="shrink-0 text-xs text-muted-foreground">
                           {subjectFlashcards.length} flashcard{subjectFlashcards.length === 1 ? "" : "s"}
                         </span>
                      </div>
                      {subjectFlashcards.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No flashcards generated for this subject yet.
                        </p>
                      ) : (
                        <div className="grid max-h-[28rem] gap-2 overflow-y-auto pr-1">
                          {subjectFlashcards.map((card) => (
                            <PracticeFlashcardItem key={card.id} card={card} />
                          ))}
                          {subjectFlashcards.length > 3 && (
                            <p className="sticky bottom-0 rounded-2xl border border-border bg-card p-3 text-center text-sm text-muted-foreground shadow-sm">
                              Scroll to preview all {subjectFlashcards.length} flashcards.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </section>
        )}
      </div>
    </div>
  );
}
