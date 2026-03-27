import AppShell from "../components/AppShell";
import GlobeView from "../components/GlobeView";

export default function GlobePage() {
  return (
    <AppShell>
      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Global Prediction Globe
        </h2>
        <p className="text-[13px] text-[var(--text-tertiary)]">
          Real-time prediction hotspots. Hover over points to see live scores.
        </p>
      </div>

      <GlobeView fullScreen />

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm mx-auto">
        {[
          { label: "Critical", color: "text-[var(--status-down)]", dotColor: "bg-[var(--status-down)]", count: 3 },
          { label: "Warning", color: "text-[var(--status-neutral)]", dotColor: "bg-[var(--status-neutral)]", count: 4 },
          { label: "Stable", color: "text-[var(--status-up)]", dotColor: "bg-[var(--status-up)]", count: 3 },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className={`w-1.5 h-1.5 rounded-full ${stat.dotColor}`} />
              <span className="text-[10px] text-[var(--text-label)] uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className={`text-lg font-bold number-display ${stat.color}`}>{stat.count}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
