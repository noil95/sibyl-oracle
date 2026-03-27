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
  up: { label: "Rising", color: "text-emerald-400", icon: "M5 10l7-7m0 0l7 7m-7-7v18" },
  down: { label: "Falling", color: "text-red-400", icon: "M19 14l-7 7m0 0l-7-7m7 7V3" },
  stable: { label: "Stable", color: "text-amber-400", icon: "M5 12h14" },
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
          <div className="w-px h-4 bg-gradient-to-b from-violet-500/40 to-violet-500/10" />
          <div className="w-3 h-3 rounded-full border-2 border-violet-500/30 bg-[var(--bg-primary)] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-violet-400" />
          </div>
          <div className="w-px h-3 bg-gradient-to-b from-violet-500/10 to-transparent" />
        </div>
      )}

      {/* Card */}
      <div className={`glass-card rounded-xl p-4 ${
        isFirst ? "ring-1 ring-violet-500/30 shadow-lg shadow-violet-500/5" : ""
      }`}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              role === "trigger"
                ? "bg-violet-500/15 text-violet-400 border border-violet-500/20"
                : multiplier > 0
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/15 text-red-400 border border-red-500/20"
            }`}>
              {multiplierStr}
            </span>
            <span className="text-[10px] text-[var(--text-label)] capitalize">{domain}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className={`w-3 h-3 ${dir.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d={dir.icon} />
            </svg>
            <span className={`text-[11px] font-semibold ${dir.color}`}>{dir.label}</span>
          </div>
        </div>

        {/* Name + score */}
        <div className="flex items-end justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-white">{name}</h3>
          <div className="text-right flex-shrink-0 ml-3">
            <span className="text-[24px] font-bold text-white number-display">{pct}</span>
            <span className="text-[13px] text-[var(--text-tertiary)]">¢</span>
            {lagLabel && (
              <div className="text-[9px] text-[var(--text-label)] mt-0.5">{lagLabel} delay</div>
            )}
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">{explanation}</p>
        )}
      </div>

      {/* Bottom connector */}
      {isLast && (
        <div className="flex flex-col items-center py-1">
          <div className="w-px h-4 bg-gradient-to-b from-pink-500/40 to-pink-500/10" />
          <div className="w-3 h-3 rounded-full border-2 border-pink-500/30 bg-[var(--bg-primary)] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-pink-400" />
          </div>
        </div>
      )}
    </div>
  );
}
