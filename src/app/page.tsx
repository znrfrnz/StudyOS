import Link from "next/link";

import { Button } from "@/components/ui/button";

const pillars = [
  "Upload study material",
  "Extract summaries and topics",
  "Generate a realistic plan",
  "Adapt when progress changes",
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <nav className="top-nav">
          <Link className="brand-link" href="/">
            StudyOS
          </Link>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy-block">
            <p className="eyebrow">
              v0.1 scaffold
            </p>
            <h1 className="hero-title">
              Know what to study next.
            </h1>
            <p className="hero-copy">
              StudyOS turns uploaded learning materials, deadlines, and availability into a focused study plan students can actually follow.
            </p>
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
          <p>Current focus: PDF upload, AI metadata, deadlines, availability, and planning.</p>
          <p>Deferred: full calendar sync, Obsidian plugin, native mobile, collaboration, and gamification.</p>
          <p>Reference docs live in <code className="inline-code">/docs</code>.</p>
        </div>
      </section>
    </main>
  );
}
