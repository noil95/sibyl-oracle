"use client";

interface DominoCardProps {
  name: string;
  domain: string;
  liveScore: number;
  adjustedScore: number;
  direction: "up" | "down" | "stable";
  multiplier: number;
  rippleDelta: number;
  explanation: string;
  lagLabel: string;
  role: "trigger" | "downstream";
  isFirst: boolean;
  isLast: boolean;
}

const directionConfig = {
  up: { label: "Rising", color: "text-[var(--status-up)]" },
  down: { label: "Falling", color: "text-[var(--status-down)]" },
  stable: { label: "Stable", color: "text-[var(--status-neutral)]" },
};

const barColors = {
  up: "bg-[var(--status-up)]",
  down: "bg-[var(--status-down)]",
  stable: "bg-[var(--status-neutral)]",
};

export default function DominoCard({
  name,
  domain,
  liveScore,
  direction,
  multiplier,
  explanation,
  lagLabel,
  role,
  isFirst,
  isLast,
}: DominoCardProps) {
  const pct = Math.round(liveScore * 100);
  const dir = directionConfig[direction];
  const multiplierStr =
    role === "trigger"
      ? "TRIGGER"
      : `${multiplier > 0 ? "+" : ""}${multiplier}x`;

  return (
    <div className="relative">
      {/* Connector line */}
      {!isFirst && (
        <div className="flex flex-col items-center py-1.5">
          <div className="w-px h-6 bg-[var(--border-primary)]" />
          <span className="text-[var(--text-tertiary)] text-xs">↓</span>
        </div>
      )}

      {/* Card */}
      <div
        className={`bg-[var(--bg-card)] border rounded-xl p-4 card-hover ${
          isFirst ? "border-[var(--accent-purple)]/30" : "border-[var(--border-primary)]"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  role === "trigger"
                    ? "bg-[var(--accent-purple-dim)] text-[var(--accent-purple)]"
                    : multiplier > 0
                    ? "bg-[var(--status-up)]/10 text-[var(--status-up)]"
                    : "bg-[var(--status-down)]/10 text-[var(--status-down)]"
                }`}
              >
                {multiplierStr}
              </span>
              <span className="text-[10px] text-[var(--text-label)] capitalize">
                {domain}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{name}</h3>
          </div>

          <span className={`text-xs font-medium ${dir.color}`}>
            {dir.label}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-end gap-2 mb-3">
          <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {pct}<span className="text-sm text-[var(--text-tertiary)]">%</span>
          </div>
          {lagLabel && (
            <span className="text-[11px] text-[var(--text-label)] pb-0.5">
              {lagLabel} delay
            </span>
          )}
        </div>

        {/* Bar */}
        <div className="h-1 bg-[var(--border-primary)] rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColors[direction]}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Explanation */}
        {explanation && (
          <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
            {explanation}
          </p>
        )}
      </div>

      {/* Connector to personal impact */}
      {isLast && (
        <div className="flex flex-col items-center py-1.5">
          <div className="w-px h-6 bg-[var(--accent-purple)]/30" />
          <span className="text-[var(--accent-purple)]/40 text-xs">↓</span>
        </div>
      )}
    </div>
  );
}
