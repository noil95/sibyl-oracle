import DomainNav from "../components/DomainNav";
import GlobeView from "../components/GlobeView";

export default function GlobePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
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
                  Global Prediction Map
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Global Prediction Globe
          </h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            Real-time prediction hotspots. Hover over points to see live scores.
          </p>
        </div>

        <GlobeView fullScreen />

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { label: "Critical", color: "text-[var(--status-down)]", dotColor: "bg-[var(--status-down)]", count: 3 },
            { label: "Warning", color: "text-[var(--status-neutral)]", dotColor: "bg-[var(--status-neutral)]", count: 4 },
            { label: "Stable", color: "text-[var(--status-up)]", dotColor: "bg-[var(--status-up)]", count: 3 },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className={`w-2 h-2 rounded-full ${stat.dotColor}`} />
                <span className="text-xs text-[var(--text-label)]">{stat.label}</span>
              </div>
              <div className={`text-lg font-bold ${stat.color}`}>{stat.count}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
