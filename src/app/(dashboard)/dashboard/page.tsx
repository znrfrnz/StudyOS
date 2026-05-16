const sessions = [
  {
    time: "4:00 PM",
    title: "Review Calculus Chapter 3",
    detail: "Derivatives and practice problems",
  },
  {
    time: "6:30 PM",
    title: "Summarize SQL normalization notes",
    detail: "Mark confusing topics for review",
  },
];

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <div className="content-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="page-title">Today&apos;s study plan</h1>
          </div>
          <p className="header-copy">
            Placeholder dashboard for the MVP loop. Wire this to real subjects, files, deadlines, and sessions as features land.
          </p>
        </header>

        <section className="dashboard-grid">
          <div className="surface-card">
            <h2 className="section-title">Sessions</h2>
            <div className="stack-sm">
              {sessions.map((session) => (
                <article className="session-card" key={session.title}>
                  <p className="kicker">{session.time}</p>
                  <h3 className="session-title">{session.title}</h3>
                  <p className="session-detail">{session.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="stack-md">
            <div className="surface-card">
              <p className="kicker">Upcoming deadline</p>
              <h2 className="card-title">Calculus Exam</h2>
              <p className="card-meta">6 days remaining</p>
            </div>
            <div className="surface-card">
              <p className="kicker">Next build target</p>
              <h2 className="card-title">Subjects CRUD</h2>
              <p className="card-meta">Phase 1 foundation work from the roadmap.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
