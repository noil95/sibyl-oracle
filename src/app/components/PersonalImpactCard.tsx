"use client";

import Link from "next/link";

interface PersonalImpactCardProps {
  headline: string;
  detail: string;
  severity: "low" | "medium" | "high";
  direction: "positive" | "negative" | "neutral";
  relevanceScore: number;
  affectedHoldings: string[];
  hasProfile: boolean;
}

const severityConfig = {
  low: { label: "Low Impact", color: "text-[var(--status-up)]" },
  medium: { label: "Medium Impact", color: "text-[var(--status-neutral)]" },
  high: { label: "High Impact", color: "text-[var(--status-down)]" },
};

const directionConfig = {
  positive: { label: "Positive", color: "text-[var(--status-up)]" },
  negative: { label: "Negative", color: "text-[var(--status-down)]" },
  neutral: { label: "Neutral", color: "text-[var(--status-neutral)]" },
};

export default function PersonalImpactCard({
  headline,
  detail,
  severity,
  direction,
  affectedHoldings,
  hasProfile,
}: PersonalImpactCardProps) {
  const sev = severityConfig[severity];
  const dir = directionConfig[direction];

  return (
    <div className="bg-[var(--bg-card)] border-2 border-[var(--accent-purple)]/30 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] uppercase tracking-widest text-[var(--accent-purple)] font-semibold">
          Your Impact
        </span>
      </div>

      {/* Headline */}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{headline}</h3>

      {/* Detail */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{detail}</p>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] ${sev.color}`}>
          {sev.label}
        </span>
        <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] ${dir.color}`}>
          {dir.label}
        </span>
      </div>

      {/* Affected holdings */}
      {affectedHoldings.length > 0 && (
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-label)] font-medium">
            Your Holdings Affected
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {affectedHoldings.map((holding) => (
              <span
                key={holding}
                className="text-[11px] font-mono font-medium text-[var(--accent-purple)] bg-[var(--accent-purple-dim)] px-2 py-0.5 rounded-md"
              >
                {holding}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Profile CTA */}
      {!hasProfile && (
        <Link
          href="/profile"
          className="block text-center mt-3 py-2 px-4 rounded-lg bg-[var(--accent-purple-dim)] text-[var(--accent-purple)] text-xs font-medium hover:bg-[var(--accent-purple)]/30 transition-colors"
        >
          Set up your profile for personalized impact
        </Link>
      )}
    </div>
  );
}
