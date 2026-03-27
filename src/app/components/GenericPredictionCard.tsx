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
  up: { label: "YES", color: "text-[var(--status-up)]", bg: "bg-[var(--status-up)]" },
  down: { label: "NO", color: "text-[var(--status-down)]", bg: "bg-[var(--status-down)]" },
  stable: { label: "HOLD", color: "text-[var(--status-neutral)]", bg: "bg-[var(--status-neutral)]" },
};

export default function GenericPredictionCard({
  name,
  score,
  direction,
  confidence,
  description,
}: GenericPredictionCardProps) {
  const pct = Math.round(score * 100);
  const inversePct = 100 - pct;
  const dir = directionConfig[direction];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg p-4 card-hover cursor-pointer">
      {/* Title */}
      <h3 className="text-[14px] font-medium text-white mb-1 leading-snug">{name}</h3>
      {description && (
        <p className="text-[12px] text-[var(--text-tertiary)] mb-4 line-clamp-1">
          {description}
        </p>
      )}

      {/* Probability bar — Polymarket style */}
      <div className="flex rounded-md overflow-hidden h-[36px] mb-3">
        <div
          className="flex items-center justify-center bg-[var(--status-up)]/20 transition-all duration-500"
          style={{ width: `${pct}%`, minWidth: pct > 5 ? "40px" : "0" }}
        >
          {pct > 10 && (
            <span className="text-[13px] font-semibold text-[var(--status-up)]">{pct}%</span>
          )}
        </div>
        <div
          className="flex items-center justify-center bg-[var(--status-down)]/15 transition-all duration-500"
          style={{ width: `${inversePct}%`, minWidth: inversePct > 5 ? "40px" : "0" }}
        >
          {inversePct > 10 && (
            <span className="text-[13px] font-semibold text-[var(--status-down)]">{inversePct}%</span>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${dir.color} ${dir.bg}/15`}>
            {dir.label}
          </span>
          <span className="text-[11px] text-[var(--text-label)]">
            {Math.round(confidence * 100)}% conf.
          </span>
        </div>
        <span className="text-[20px] font-bold text-white number-display">
          {pct}<span className="text-[13px] text-[var(--text-tertiary)]">¢</span>
        </span>
      </div>
    </div>
  );
}
