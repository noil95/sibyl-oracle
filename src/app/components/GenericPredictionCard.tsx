"use client";

interface GenericPredictionCardProps {
  name: string;
  slug: string;
  domain: "economic" | "tech";
  score: number;
  direction: "up" | "down" | "stable";
  confidence: number;
  description?: string;
  refreshTier?: string;
}

const directionConfig = {
  up: { label: "YES", color: "text-emerald-400", bg: "bg-emerald-500", barGlow: "bar-glow-up", gradient: "from-emerald-500 to-teal-500" },
  down: { label: "NO", color: "text-red-400", bg: "bg-red-500", barGlow: "bar-glow-down", gradient: "from-red-500 to-orange-500" },
  stable: { label: "HOLD", color: "text-amber-400", bg: "bg-amber-500", barGlow: "bar-glow-neutral", gradient: "from-amber-500 to-yellow-500" },
};

const domainConfig = {
  economic: { tag: "ECON", gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20", dotColor: "bg-emerald-400" },
  tech: { tag: "TECH", gradient: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/20", dotColor: "bg-orange-400" },
};

export default function GenericPredictionCard({
  name,
  score,
  direction,
  confidence,
  description,
  domain,
}: GenericPredictionCardProps) {
  const pct = Math.round(score * 100);
  const inversePct = 100 - pct;
  const dir = directionConfig[direction];
  const dom = domainConfig[domain];

  return (
    <div className={`group relative bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 card-hover cursor-pointer overflow-hidden`}>
      {/* Subtle gradient bg on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${dom.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />

      <div className="relative z-10">
        {/* Domain tag + direction */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${dom.dotColor} live-dot`} />
            <span className={`text-[9px] font-bold tracking-widest ${dom.dotColor.replace('bg-', 'text-')} uppercase`}>
              {dom.tag}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dir.color} ${dir.bg}/15 border ${dir.bg.replace('bg-', 'border-')}/20`}>
            {dir.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-semibold text-white mb-1 leading-snug">{name}</h3>
        {description && (
          <p className="text-[11px] text-[var(--text-tertiary)] mb-3 line-clamp-1">
            {description}
          </p>
        )}

        {/* Probability bar */}
        <div className="flex rounded-lg overflow-hidden h-[32px] mb-3 bg-[var(--bg-primary)]/50">
          <div
            className={`flex items-center justify-center bg-gradient-to-r from-emerald-500/25 to-emerald-400/15 transition-all duration-700 ease-out`}
            style={{ width: `${pct}%`, minWidth: pct > 5 ? "36px" : "0" }}
          >
            {pct > 10 && (
              <span className="text-[12px] font-bold text-emerald-400 number-display">{pct}%</span>
            )}
          </div>
          <div
            className="flex items-center justify-center bg-gradient-to-r from-red-500/10 to-red-400/20 transition-all duration-700 ease-out"
            style={{ width: `${inversePct}%`, minWidth: inversePct > 5 ? "36px" : "0" }}
          >
            {inversePct > 10 && (
              <span className="text-[12px] font-bold text-red-400 number-display">{inversePct}%</span>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-8 h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all"
                  style={{ width: `${Math.round(confidence * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-[var(--text-label)] number-display">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>
          <span className="text-[22px] font-bold text-white number-display score-animate">
            {pct}<span className="text-[12px] text-[var(--text-tertiary)] ml-0.5">¢</span>
          </span>
        </div>
      </div>
    </div>
  );
}
