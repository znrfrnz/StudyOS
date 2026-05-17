-- Enable Row Level Security on tables flagged by Supabase database linter.
-- Prisma connects directly to Postgres (superuser), so ORM ops are unaffected.
-- These policies only apply to PostgREST / Supabase client access.

-- 1. _prisma_migrations: managed by Prisma, should not be accessible via Supabase APIs.
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

-- 2. deadlines
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own deadlines"
ON public.deadlines FOR ALL TO authenticated
USING (user_id = (auth.uid())::text)
WITH CHECK (user_id = (auth.uid())::text);

-- 3. availability_blocks
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own availability_blocks"
ON public.availability_blocks FOR ALL TO authenticated
USING (user_id = (auth.uid())::text)
WITH CHECK (user_id = (auth.uid())::text);

-- 4. study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own study_sessions"
ON public.study_sessions FOR ALL TO authenticated
USING (user_id = (auth.uid())::text)
WITH CHECK (user_id = (auth.uid())::text);

-- 5. quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own quizzes"
ON public.quizzes FOR ALL TO authenticated
USING (user_id = (auth.uid())::text)
WITH CHECK (user_id = (auth.uid())::text);

-- 6. quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own quiz_attempts"
ON public.quiz_attempts FOR ALL TO authenticated
USING (user_id = (auth.uid())::text)
WITH CHECK (user_id = (auth.uid())::text);

-- 7. weak_topic_signals
ALTER TABLE public.weak_topic_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own weak_topic_signals"
ON public.weak_topic_signals FOR ALL TO authenticated
USING (user_id = (auth.uid())::text)
WITH CHECK (user_id = (auth.uid())::text);

-- 8. flashcards
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own flashcards"
ON public.flashcards FOR ALL TO authenticated
USING (user_id = (auth.uid())::text)
WITH CHECK (user_id = (auth.uid())::text);

-- 9. quiz_questions (child of quizzes, no direct user_id column)
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage quiz questions for their own quizzes"
ON public.quiz_questions FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = (auth.uid())::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = (auth.uid())::text
  )
);
