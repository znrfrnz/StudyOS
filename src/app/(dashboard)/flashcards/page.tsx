import { redirect } from "next/navigation";

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ subjectId?: string; quizId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const params = new URLSearchParams();

  if (resolvedSearchParams.subjectId) {
    params.set("subjectId", resolvedSearchParams.subjectId);
  }

  if (resolvedSearchParams.quizId) {
    params.set("quizId", resolvedSearchParams.quizId);
  }

  redirect(params.size > 0 ? `/practice?${params.toString()}` : "/practice");
}
