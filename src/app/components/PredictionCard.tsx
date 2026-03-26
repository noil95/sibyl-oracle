"use client";

interface PredictionCardProps {
  candidateName: string;
  party: string;
  winProbability: number;
  confidence: number;
}

const PARTY_STYLES: Record<
  string,
  { bar: string; accent: string; badge: string }
> = {
  Democrat: {
    bar: "bg-blue-500",
    accent: "text-blue-400",
    badge: "text-blue-400 bg-blue-500/10",
  },
  Republican: {
    bar: "bg-red-500",
    accent: "text-red-400",
    badge: "text-red-400 bg-red-500/10",
  },
};

const DEFAULT_STYLE = {
  bar: "bg-gray-500",
  accent: "text-gray-400",
  badge: "text-gray-400 bg-gray-500/10",
};

export default function PredictionCard({
  candidateName,
  party,
  winProbability,
  confidence,
}: PredictionCardProps) {
  const pct = Math.round(winProbability * 100);
  const s = PARTY_STYLES[party] ?? DEFAULT_STYLE;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 card-hover flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            {candidateName}
          </h2>
          <span className={`inline-block text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md ${s.badge}`}>
            {party}
          </span>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-[var(--text-primary)] score-animate tabular-nums">
            {pct}
            <span className="text-base text-[var(--text-tertiary)]">%</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-label)] mt-1">
            Win Probability
          </div>
        </div>
      </div>

      {/* Probability bar */}
      <div className="w-full h-1 bg-[var(--border-primary)] rounded-full overflow-hidden">
        <div
          className={`h-full ${s.bar} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Confidence */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-label)]">Confidence</span>
        <span className={`text-xs font-mono font-medium ${s.accent}`}>
          {Math.round(confidence * 100)}%
        </span>
      </div>
    </div>
  );
}
