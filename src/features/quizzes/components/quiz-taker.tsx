"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

import { submitQuizAttempt } from "@/features/quizzes/actions";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceExcerpt: string | null;
  topic: string;
}

interface QuizTakerProps {
  quizId: string;
  questions: Question[];
  title: string;
}

export function QuizTaker({ quizId, questions, title }: QuizTakerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  function handleSelect(questionId: string, option: string) {
    if (submitted) return;
    setSubmitError(null);
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  function handleSubmit() {
    if (!allAnswered) {
      setSubmitError("Answer every question before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitQuizAttempt(quizId, answers);
        setScore(result.score);
        setSubmitted(true);
      } catch {
        setSubmitError("Failed to submit quiz. Try again.");
      }
    });
  }

  if (submitted) {
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="stack-md">
        <div className="surface-card text-center">
          <h2 className="text-2xl font-semibold">Quiz complete</h2>
          <p className="mt-2 text-5xl font-semibold">{percentage}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {score} of {total} correct
          </p>
        </div>

        <div className="stack-sm">
          {questions.map((q, i) => {
            const selected = answers[q.id];
            const isCorrect = selected === q.correctAnswer;

            return (
              <div key={q.id} className="surface-card">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-sm font-medium text-muted-foreground">
                    {i + 1}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{q.question}</p>
                    <div className="mt-3 grid gap-2">
                      {q.options.map((opt) => {
                        const isSelected = selected === opt;
                        const isCorrectOption = q.correctAnswer === opt;

                        let borderClass = "border-border";
                        let bgClass = "bg-background";

                        if (isSelected && isCorrectOption) {
                          borderClass = "border-green-300";
                          bgClass = "bg-green-50";
                        } else if (isSelected && !isCorrectOption) {
                          borderClass = "border-red-300";
                          bgClass = "bg-red-50";
                        } else if (isCorrectOption) {
                          borderClass = "border-green-300";
                          bgClass = "bg-green-50";
                        }

                        return (
                          <div
                            key={opt}
                            className={`rounded-xl border ${borderClass} ${bgClass} px-4 py-3 text-sm`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrectOption && (
                                <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                              )}
                              {isSelected && !isCorrectOption && (
                                <XCircle className="size-4 shrink-0 text-red-600" />
                              )}
                              <span>{opt}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {q.explanation}
                    </p>
                    {q.sourceExcerpt && (
                      <blockquote className="mt-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                        {q.sourceExcerpt}
                      </blockquote>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.push("/quizzes")}
          className="btn btn-default w-full"
        >
          Back to quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="stack-md">
      <div className="surface-card">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {answeredCount} of {questions.length} answered
        </p>
      </div>

      <div className="stack-sm">
        {questions.map((q, i) => (
          <div key={q.id} className="surface-card">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-sm font-medium text-muted-foreground">
                {i + 1}.
              </span>
              <fieldset className="min-w-0 flex-1">
                <legend className="font-medium">{q.question}</legend>
                <div className="mt-3 grid gap-2">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <label
                        key={opt}
                        className="block cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={isSelected}
                          onChange={() => handleSelect(q.id, opt)}
                          className="peer sr-only"
                        />
                        <span
                          className={`block rounded-xl border px-4 py-3 text-left text-sm transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:bg-muted"
                          }`}
                        >
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          </div>
        ))}
      </div>

      {submitError && (
        <p className="text-sm text-red-700" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="button"
        aria-describedby="quiz-submit-status"
        disabled={isPending || !allAnswered}
        onClick={handleSubmit}
        className="btn btn-default w-full disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Submit quiz <ArrowRight className="size-4" />
          </>
        )}
      </button>
      <p id="quiz-submit-status" className="text-center text-xs text-muted-foreground">
        {allAnswered ? "Ready to submit." : "Answer all questions to submit."}
      </p>
    </div>
  );
}
