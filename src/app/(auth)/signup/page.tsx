import Link from "next/link";
import type { Metadata } from "next";

import { signUp } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a StudyOS account to turn materials and deadlines into a realistic study plan.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="page-shell">
      <div className="mx-auto flex max-w-md flex-col gap-8 pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-semibold" style={{ letterSpacing: "-0.04em" }}>
            Get started
          </h1>
          <p className="mt-4 text-muted-foreground">
            Create your StudyOS account
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={signUp} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-default mt-2">
            Create account
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
