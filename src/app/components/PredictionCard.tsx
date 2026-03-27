"use client";

interface PredictionCardProps {
  candidateName: string;
  party: string;
  winProbability: number;
  confidence: number;
}

const PARTY_STYLES: Record<string, { bar: string; accent: string; badge: string; badgeBg: string }> = {
  Democrat: {
    bar: "bg-blue-500",
    accent: "text-blue-400",
    badge: "text-blue-400",
    badgeBg: "bg-blue-500/10",
  },
  Republican: {
    bar: "bg-red-500",
    accent: "text-red-400",
    badge: "text-red-400",
    badgeBg: "bg-red-500/10",
  },
};

const DEFAULT_STYLE = {
  bar: "bg-gray-500",
  accent: "text-gray-400",
  badge: "text-gray-400",
  badgeBg: "bg-gray-500/10",
};

export default function PredictionCard({
  candidateName,
  party,
  winProbability,
  confidence,
}: PredictionCardProps) {
  const pct = Math.round(winProbability * 100);
  const s = PARTY_STYLES[party] ?? DEFAULT_STYLE;
  const isLeading = pct > 50;

  return (
    <div className={`bg-[var(--bg-card)] border rounded-xl p-5 card-hover flex flex-col gap-4 ${
      isLeading ? "border-[var(--border-hover)]" : "border-[var(--border-primary)]"
    }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
            {candidateName}
          </h2>
          <span className={`inline-block text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded ${s.badge} ${s.badgeBg}`}>
            {party}
          </span>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-[var(--text-primary)] number-display score-animate">
            {pct}
            <span className="text-sm text-[var(--text-label)] ml-0.5">%</span>
          </div>
          <div className="text-[9px] uppercase tracking-widest text-[var(--text-label)] mt-1">
            Win Prob.
          </div>
        </div>
      </div>

      {/* Probability bar */}
      <div className="w-full h-[3px] bg-[var(--border-primary)] rounded-full overflow-hidden">
        <div
          className={`h-full ${s.bar} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, opacity: 0.8 }}
        />
      </div>

      {/* Confidence */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-label)] uppercase tracking-wider">Confidence</span>
        <span className={`text-[11px] font-mono font-medium ${s.accent}`}>
          {Math.round(confidence * 100)}%
        </span>
      </div>
    </div>
  );
}
