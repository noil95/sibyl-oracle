"use client";

interface PredictionCardProps {
  candidateName: string;
  party: string;
  winProbability: number;
  confidence: number;
}

const PARTY_STYLES: Record<string, { color: string; bg: string; gradient: string; glow: string }> = {
  Democrat: { color: "text-blue-400", bg: "bg-blue-500", gradient: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/20" },
  Republican: { color: "text-red-400", bg: "bg-red-500", gradient: "from-red-500 to-rose-500", glow: "shadow-red-500/20" },
};

const DEFAULT_STYLE = { color: "text-gray-400", bg: "bg-gray-500", gradient: "from-gray-500 to-slate-500", glow: "shadow-gray-500/20" };

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
    <div className={`group relative bg-[var(--bg-card)] border rounded-xl p-5 card-hover overflow-hidden ${
      isLeading ? `border-transparent ring-1 ring-${s.bg.replace('bg-', '')}/30 shadow-lg ${s.glow}` : "border-[var(--border-primary)]"
    }`}>
      {/* Gradient accent top bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${s.gradient} ${isLeading ? "opacity-100" : "opacity-30"}`} />

      {/* Name + party */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[17px] font-bold text-white">{candidateName}</h2>
          <span className={`text-[11px] font-semibold ${s.color}`}>{party}</span>
        </div>
        {isLeading && (
          <div className={`flex items-center gap-1.5 bg-gradient-to-r ${s.gradient} text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 9.707l1.414-1.414L10 11.586l3.293-3.293 1.414 1.414L10 14.414l-4.707-4.707z" transform="rotate(180 10 10)" /></svg>
            Leading
          </div>
        )}
      </div>

      {/* Big number */}
      <div className="mb-5">
        <span className={`text-[52px] font-black number-display leading-none ${isLeading ? "gradient-text" : "text-white"}`}>
          {pct}
        </span>
        <span className="text-[20px] text-[var(--text-tertiary)] ml-1">¢</span>
      </div>

      {/* Bar */}
      <div className="h-[6px] bg-[var(--bg-elevated)] rounded-full overflow-hidden mb-3">
        <div
          className={`h-full bg-gradient-to-r ${s.gradient} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Confidence */}
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[var(--text-label)]">Confidence</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
              style={{ width: `${Math.round(confidence * 100)}%` }}
            />
          </div>
          <span className="text-[var(--text-secondary)] font-bold number-display">{Math.round(confidence * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
