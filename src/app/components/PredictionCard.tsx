"use client";

interface PredictionCardProps {
  candidateName: string;
  party: string;
  winProbability: number;
  confidence: number;
}

const PARTY_STYLES: Record<string, { color: string; bg: string }> = {
  Democrat: { color: "text-blue-400", bg: "bg-blue-500" },
  Republican: { color: "text-red-400", bg: "bg-red-500" },
};

const DEFAULT_STYLE = { color: "text-gray-400", bg: "bg-gray-500" };

export default function PredictionCard({
  candidateName,
  party,
  winProbability,
  confidence,
}: PredictionCardProps) {
  const pct = Math.round(winProbability * 100);
  const s = PARTY_STYLES[party] ?? DEFAULT_STYLE;
  const isLeading = pct >= 50;

  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg p-5 card-hover ${
      isLeading ? "ring-1 ring-[var(--border-hover)]" : ""
    }`}>
      {/* Name + party */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-semibold text-white">{candidateName}</h2>
          <span className={`text-[11px] font-medium ${s.color}`}>{party}</span>
        </div>
        {isLeading && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--status-up)] bg-[var(--status-up)]/10 px-2 py-0.5 rounded">
            Leading
          </span>
        )}
      </div>

      {/* Big number */}
      <div className="mb-4">
        <span className="text-[48px] font-bold text-white number-display leading-none">{pct}</span>
        <span className="text-[20px] text-[var(--text-tertiary)] ml-0.5">¢</span>
      </div>

      {/* Bar */}
      <div className="h-[4px] bg-[var(--bg-elevated)] rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${s.bg} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Confidence */}
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[var(--text-label)]">Confidence</span>
        <span className="text-[var(--text-secondary)] font-medium number-display">{Math.round(confidence * 100)}%</span>
      </div>
    </div>
  );
}
