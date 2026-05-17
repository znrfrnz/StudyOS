import Link from "next/link";
import { ArrowLeft, HelpCircle, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";

import { getQuiz } from "@/features/quizzes/actions";
import { QuizTaker } from "@/features/quizzes/components/quiz-taker";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = await getQuiz(id);

  if (!quiz) {
    notFound();
  }

  return (
    <div className="page-shell">
      <div className="content-shell">
        <Link
          href="/quizzes"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to quizzes
        </Link>

        <QuizTaker
          quizId={quiz.id}
          title={quiz.title}
          questions={quiz.questions}
        />
      </div>
    </div>
  );
}
