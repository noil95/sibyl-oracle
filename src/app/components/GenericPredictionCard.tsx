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
  up: { label: "Bullish", color: "text-[var(--status-up)]", bgColor: "bg-[var(--status-up-dim)]", barColor: "bg-[var(--status-up)]" },
  down: { label: "Bearish", color: "text-[var(--status-down)]", bgColor: "bg-[var(--status-down-dim)]", barColor: "bg-[var(--status-down)]" },
  stable: { label: "Neutral", color: "text-[var(--status-neutral)]", bgColor: "bg-[var(--status-neutral-dim)]", barColor: "bg-[var(--status-neutral)]" },
};

export default function GenericPredictionCard({
  name,
  domain,
  score,
  direction,
  confidence,
  description,
}: GenericPredictionCardProps) {
  const pct = Math.round(score * 100);
  const dir = directionConfig[direction];
  const domainLabel = domain === "economic" ? "ECON" : "TECH";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 card-hover flex flex-col justify-between">
      {/* Top section */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text-label)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                {domainLabel}
              </span>
            </div>
            <h3 className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">{name}</h3>
            {description && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${dir.color} ${dir.bgColor} uppercase tracking-wider`}>
            {dir.label}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-bold text-[var(--text-primary)] number-display score-animate">
            {pct}
          </span>
          <span className="text-sm text-[var(--text-label)] font-medium">%</span>
        </div>
      </div>

      {/* Bottom section */}
      <div>
        {/* Progress bar */}
        <div className="h-[3px] bg-[var(--border-primary)] rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full ${dir.barColor} transition-all duration-700`}
            style={{ width: `${pct}%`, opacity: 0.8 }}
          />
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--text-label)] uppercase tracking-wider">
            Confidence
          </span>
          <span className="text-[11px] font-medium text-[var(--text-secondary)] number-display">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
