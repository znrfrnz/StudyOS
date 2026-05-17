export default function DashboardLoading() {
  return (
    <div className="page-shell">
      <div className="content-shell">
        <div className="surface-card animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-full bg-muted" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-36 rounded-3xl bg-muted" />
            <div className="h-36 rounded-3xl bg-muted" />
          </div>
          <div className="h-56 rounded-3xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
