import DomainNav from "../components/DomainNav";
import Dashboard from "../components/Dashboard";

export default function PoliticsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] bg-subtle">
      <header className="border-b border-[var(--border-primary)] px-4 sm:px-6 py-4 sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-purple)] flex items-center justify-center text-sm font-bold text-white">
                S
              </div>
              <div>
                <h1 className="text-base font-semibold text-[var(--text-primary)]">
                  Sibyl Oracle
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-label)]">
                  Political Predictions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-primary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-up)] live-dot" />
              <span className="text-[10px] text-[var(--text-label)] font-medium">Live</span>
            </div>
          </div>
          <DomainNav />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Dashboard />
      </main>

      <footer className="border-t border-[var(--border-primary)] px-4 sm:px-6 py-6 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-label)]">
            Sibyl Oracle — Predictions are probabilistic estimates, not guarantees.
          </p>
          <p className="text-xs text-[var(--text-label)]">
            Updated every 15 minutes from news, social media, and polling data.
          </p>
        </div>
      </footer>
    </div>
  );
}
