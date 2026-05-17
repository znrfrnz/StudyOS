import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

const homeDescription =
  "StudyOS helps students turn class materials, deadlines, and availability into a realistic study plan.";

export const metadata: Metadata = {
  title: "Know what to study next",
  description: homeDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "StudyOS: Know what to study next",
    description: homeDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyOS: Know what to study next",
    description: homeDescription,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "StudyOS",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description: homeDescription,
};

const pillars = [
  "Upload study material",
  "Extract summaries and topics",
  "Generate a realistic plan",
  "Adapt when progress changes",
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="hero-panel">
        <nav className="top-nav">
          <Link className="brand-link" href="/">
            <img src="/Logo.svg" alt="StudyOS" className="h-14" />
          </Link>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy-block">
            <h1 className="hero-title">
              Know what to study next.
            </h1>
            <p className="hero-copy">
              StudyOS turns uploaded learning materials, deadlines, and availability into a focused study plan students can actually follow.
            </p>
            <div className="mt-10 flex gap-4">
              <Link href={user ? "/dashboard" : "/login"} className="btn btn-default">
                {user ? "Go to dashboard" : "Start planning"}
              </Link>
              {!user && (
                <Link href="/login" className="btn btn-secondary">
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <div className="pillar-list">
            {pillars.map((pillar, index) => (
              <div className="pillar-card" key={pillar}>
                <span className="pillar-index">
                  {index + 1}
                </span>
                <span className="pillar-label">{pillar}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-footer">
          <p>Plan from real deadlines instead of vague study goals.</p>
          <p>Use uploaded PDFs to create sessions, quizzes, and flashcards.</p>
          <p>Keep study blocks realistic with your actual availability.</p>
        </div>
      </section>
    </main>
  );
}
