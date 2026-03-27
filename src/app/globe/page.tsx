import AppShell from "../components/AppShell";
import GlobeView from "../components/GlobeView";

export default function GlobePage() {
  return (
    <AppShell>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-[24px] font-bold text-white tracking-tight">
            Global Prediction Globe
          </h2>
        </div>
        <p className="text-[13px] text-[var(--text-tertiary)]">
          Real-time prediction hotspots. Hover over points to see live scores.
        </p>
      </div>

      <GlobeView fullScreen />

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
        {[
          { label: "Critical", gradient: "from-red-500 to-rose-500", count: 3 },
          { label: "Warning", gradient: "from-amber-500 to-yellow-500", count: 4 },
          { label: "Stable", gradient: "from-emerald-500 to-teal-500", count: 3 },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 text-center group card-hover cursor-default">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.gradient}`} />
              <span className="text-[10px] text-[var(--text-label)] uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
            <div className={`text-[22px] font-bold number-display bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
              {stat.count}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
