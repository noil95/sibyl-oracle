"use client";

export interface ForkResult {
  slug: string;
  originalScore: number;
  forkedScore: number;
  delta: number;
  direction: "up" | "down" | "stable";
}

interface ForkViewProps {
  results: ForkResult[];
}

const DIRECTION_CONFIG = {
  up: {
    textClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
    barClass: "bg-emerald-400",
    symbol: "▲",
  },
  down: {
    textClass: "text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/20",
    barClass: "bg-red-400",
    symbol: "▼",
  },
  stable: {
    textClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
    barClass: "bg-amber-400",
    symbol: "◆",
  },
};

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ForkView({ results }: ForkViewProps) {
  if (results.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-8 text-center">
        <p className="text-[var(--text-tertiary)] text-[13px]">
          Adjust sliders to see predicted impact on related indicators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((result) => {
        const cfg = DIRECTION_CONFIG[result.direction];
        const origPct = Math.round(result.originalScore * 100);
        const forkPct = Math.round(result.forkedScore * 100);
        const deltaPct = Math.abs(Math.round(result.delta * 100));
        // Delta bar width capped at 100%, scaled so 20% delta = full bar
        const barWidth = Math.min(100, (deltaPct / 20) * 100);

        return (
          <div
            key={result.slug}
            className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4"
          >
            <div className="flex items-center gap-4">
              {/* Direction badge */}
              <div
                className={`w-9 h-9 rounded-lg ${cfg.bgClass} border ${cfg.borderClass} flex items-center justify-center flex-shrink-0`}
              >
                <span className={`text-[14px] ${cfg.textClass}`}>
                  {cfg.symbol}
                </span>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                  {formatSlug(result.slug)}
                </p>

                {/* Delta bar */}
                <div className="mt-1.5 h-1 w-full bg-[var(--border-primary)] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cfg.barClass} rounded-full transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>

              {/* Score comparison */}
              <div className="flex items-center gap-2 flex-shrink-0 text-right">
                <span className="text-[14px] font-medium text-[var(--text-tertiary)] number-display">
                  {origPct}%
                </span>
                <svg
                  className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span
                  className={`text-[14px] font-bold number-display ${cfg.textClass}`}
                >
                  {forkPct}%
                </span>
              </div>

              {/* Delta label */}
              <div
                className={`flex-shrink-0 px-2 py-0.5 rounded-md ${cfg.bgClass} border ${cfg.borderClass}`}
              >
                <span className={`text-[11px] font-bold ${cfg.textClass}`}>
                  {result.direction === "up" ? "+" : result.direction === "down" ? "-" : "±"}
                  {deltaPct}pp
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
