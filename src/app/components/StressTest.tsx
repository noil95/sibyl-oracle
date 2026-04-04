"use client";

interface FragilityResult {
  slug: string;
  originalScore: number;
  shockedScore: number;
  fragility: number;
  direction: "up" | "down" | "stable";
}

interface StressTestProps {
  results: FragilityResult[];
  scenarioName: string;
}

function ChangeBar({ delta }: { delta: number }) {
  const pct = Math.min(100, Math.abs(delta) * 100);
  const isUp = delta > 0;

  return (
    <div className="flex items-center gap-2">
      <span
        className={[
          "text-[12px] font-semibold tabular-nums w-[52px] text-right",
          delta === 0
            ? "text-[var(--text-tertiary)]"
            : isUp
            ? "text-emerald-400"
            : "text-red-400",
        ].join(" ")}
      >
        {delta === 0 ? "—" : `${isUp ? "+" : ""}${(delta * 100).toFixed(1)}%`}
      </span>
      <div className="flex-1 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isUp ? "bg-emerald-500" : "bg-red-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FragilityBar({ fragility }: { fragility: number }) {
  const pct = Math.min(100, fragility * 100);
  const color =
    pct > 60 ? "bg-red-500" : pct > 30 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-[80px] h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-[var(--text-tertiary)]">{pct.toFixed(0)}%</span>
    </div>
  );
}

export default function StressTest({ results, scenarioName }: StressTestProps) {
  if (results.length === 0) {
    return (
      <div className="text-[var(--text-tertiary)] text-sm py-8 text-center">
        No results
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-tertiary)]">
          Scenario: <span className="text-violet-400">{scenarioName}</span>
        </p>
        <p className="text-[11px] text-[var(--text-tertiary)]">
          {results.length} predictions tested
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-primary)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-elevated)]">
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
                Prediction
              </th>
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
                Original
              </th>
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
                Shocked
              </th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium text-left">
                Change
              </th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium text-left">
                Fragility
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const delta = r.shockedScore - r.originalScore;
              return (
                <tr
                  key={r.slug}
                  className={[
                    "border-b border-[var(--border-primary)] last:border-0",
                    i % 2 === 0 ? "bg-[var(--bg-card)]" : "bg-[var(--bg-elevated)]",
                  ].join(" ")}
                >
                  <td className="px-4 py-3 text-[13px] text-[var(--text-primary)] font-medium">
                    {r.slug}
                  </td>
                  <td className="px-4 py-3 text-right text-[13px] text-[var(--text-secondary)] tabular-nums">
                    {(r.originalScore * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right text-[13px] text-[var(--text-secondary)] tabular-nums">
                    {(r.shockedScore * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 min-w-[160px]">
                    <ChangeBar delta={delta} />
                  </td>
                  <td className="px-4 py-3 min-w-[140px]">
                    <FragilityBar fragility={r.fragility} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
