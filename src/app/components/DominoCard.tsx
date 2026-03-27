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
  const multiplierStr = role === "trigger" ? "TRIGGER" : `${multiplier > 0 ? "+" : ""}${multiplier}x`;

  return (
    <div className="relative">
      {/* Connector */}
      {!isFirst && (
        <div className="flex flex-col items-center py-1">
          <div className="w-px h-5 bg-[var(--border-primary)]" />
          <div className="w-2 h-2 rounded-full border border-[var(--border-primary)] bg-[var(--bg-primary)]" />
          <div className="w-px h-2 bg-[var(--border-primary)]" />
        </div>
      )}

      {/* Card */}
      <div className={`bg-[var(--bg-card)] border rounded-lg p-4 ${
        isFirst ? "border-[var(--accent-purple)]/40" : "border-[var(--border-primary)]"
      }`}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              role === "trigger"
                ? "bg-[var(--accent-purple-dim)] text-[var(--accent-purple)]"
                : multiplier > 0
                ? "bg-[var(--status-up-dim)] text-[var(--status-up)]"
                : "bg-[var(--status-down-dim)] text-[var(--status-down)]"
            }`}>
              {multiplierStr}
            </span>
            <span className="text-[10px] text-[var(--text-label)] capitalize">{domain}</span>
          </div>
          <span className={`text-[11px] font-medium ${dir.color}`}>{dir.label}</span>
        </div>

        {/* Name + score */}
        <div className="flex items-end justify-between mb-3">
          <h3 className="text-[14px] font-medium text-white">{name}</h3>
          <div className="text-right flex-shrink-0 ml-3">
            <span className="text-[22px] font-bold text-white number-display">{pct}</span>
            <span className="text-[13px] text-[var(--text-tertiary)]">¢</span>
            {lagLabel && (
              <div className="text-[10px] text-[var(--text-label)]">{lagLabel} delay</div>
            )}
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">{explanation}</p>
        )}
      </div>

      {/* Bottom connector to impact */}
      {isLast && (
        <div className="flex flex-col items-center py-1">
          <div className="w-px h-5 bg-[var(--accent-purple)]/30" />
          <div className="w-2 h-2 rounded-full border border-[var(--accent-purple)]/30 bg-[var(--bg-primary)]" />
        </div>
      )}
    </div>
  );
}
