"use client";

interface PredictionCardProps {
  candidateName: string;
  party: string;
  winProbability: number;
  confidence: number;
}

const PARTY_STYLES: Record<
  string,
  { border: string; glow: string; bar: string; accent: string; badge: string }
> = {
  Democrat: {
    border: "border-blue-500/20",
    glow: "glow-blue",
    bar: "bg-gradient-to-r from-blue-600 to-blue-400",
    accent: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  Republican: {
    border: "border-red-500/20",
    glow: "glow-red",
    bar: "bg-gradient-to-r from-red-600 to-red-400",
    accent: "text-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

const DEFAULT_STYLE = {
  border: "border-gray-500/20",
  glow: "",
  bar: "bg-gradient-to-r from-gray-600 to-gray-400",
  accent: "text-gray-400",
  badge: "bg-gray-500/10 text-gray-400 border-gray-500/20",
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
    <div
      className={`${s.border} ${s.glow} card-hover border bg-white/[0.03] backdrop-blur-sm rounded-2xl p-5 sm:p-6 flex flex-col gap-4`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
            {candidateName}
          </h2>
          <span
            className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${s.badge}`}
          >
            {party}
          </span>
        </div>
        <div className="text-right">
          <div className="text-4xl sm:text-5xl font-black text-white score-animate tabular-nums">
            {pct}
            <span className="text-lg text-white/40">%</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/30 mt-1">
            Win Probability
          </div>
        </div>
      </div>

      {/* Probability bar */}
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${s.bar} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Confidence indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span className="font-medium">Confidence</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-5 h-1.5 rounded-full transition-all ${
                  confidence >= level / 5
                    ? s.bar
                    : "bg-white/5"
                }`}
              />
            ))}
          </div>
        </div>
        <span className={`text-xs font-mono font-medium ${s.accent}`}>
          {Math.round(confidence * 100)}%
        </span>
      </div>
    </div>
  );
}
