"use client";

interface GenericPredictionCardProps {
  name: string;
  slug: string;
  domain: "economic" | "tech";
  score: number; // 0-1
  direction: "up" | "down" | "stable";
  confidence: number; // 0-1
  description?: string;
  refreshTier?: string;
}

const directionConfig = {
  up: { label: "Bullish", color: "text-[var(--status-up)]", barColor: "bg-[var(--status-up)]" },
  down: { label: "Bearish", color: "text-[var(--status-down)]", barColor: "bg-[var(--status-down)]" },
  stable: { label: "Neutral", color: "text-[var(--status-neutral)]", barColor: "bg-[var(--status-neutral)]" },
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
  const domainLabel = domain === "economic" ? "Economy" : "Tech";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{name}</h3>
          {description && (
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Direction badge */}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${dir.color}`}>
          {dir.label}
        </span>
      </div>

      {/* Score display */}
      <div className="flex items-end gap-2 mb-3">
        <div className="text-3xl font-bold text-[var(--text-primary)] score-animate tabular-nums">
          {pct}<span className="text-base text-[var(--text-tertiary)]">%</span>
        </div>
        <span className="text-[10px] text-[var(--text-label)] pb-1.5 uppercase tracking-wider">
          {domainLabel}
        </span>
      </div>

      {/* Progress bar — thin, solid color */}
      <div className="h-1 bg-[var(--border-primary)] rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full ${dir.barColor} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Confidence as text */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-label)]">
          Confidence
        </span>
        <span className="text-xs font-medium text-[var(--text-secondary)] tabular-nums">
          {Math.round(confidence * 100)}%
        </span>
      </div>
    </div>
  );
}
