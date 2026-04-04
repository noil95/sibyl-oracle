interface SourceCardProps {
  source: string;
  value: number;
  weight: number;
  fetchedAt: string;
  isOutlier: boolean;
}

function formatFetchedAt(ts: string) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SourceCard({
  source,
  value,
  weight,
  fetchedAt,
  isOutlier,
}: SourceCardProps) {
  const pct = Math.round(Math.min(100, Math.max(0, value * 100)));

  return (
    <div
      className={[
        "bg-[var(--bg-card)] border rounded-xl p-4 space-y-3",
        isOutlier
          ? "border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          : "border-[var(--border-primary)]",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-semibold text-[var(--text-primary)] break-words">
          {source}
        </span>
        {isOutlier && (
          <span className="shrink-0 text-[9px] uppercase tracking-widest font-medium text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
            Outlier
          </span>
        )}
      </div>

      {/* Value bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">
            Value
          </span>
          <span className="text-[13px] font-bold text-[var(--text-primary)]">{pct}%</span>
        </div>
        <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Weight */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">
          Weight
        </span>
        <span className="text-[12px] text-[var(--text-secondary)]">
          {weight.toFixed(2)}
        </span>
      </div>

      {/* Timestamp */}
      <p className="text-[10px] text-[var(--text-tertiary)]">
        {formatFetchedAt(fetchedAt)}
      </p>
    </div>
  );
}
