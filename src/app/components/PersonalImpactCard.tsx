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
  low: { label: "Low Impact", color: "text-[var(--status-up)]", bg: "bg-[var(--status-up-dim)]" },
  medium: { label: "Medium Impact", color: "text-[var(--status-neutral)]", bg: "bg-[var(--status-neutral-dim)]" },
  high: { label: "High Impact", color: "text-[var(--status-down)]", bg: "bg-[var(--status-down-dim)]" },
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
    <div className="bg-[var(--bg-card)] border border-[var(--accent-purple)]/20 rounded-lg p-5">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-purple)] mb-3">
        Your Impact
      </div>

      <h3 className="text-[15px] font-semibold text-white mb-2">{headline}</h3>
      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">{detail}</p>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${sev.color} ${sev.bg}`}>
          {sev.label}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${dir.color} bg-[var(--bg-elevated)]`}>
          {dir.label}
        </span>
      </div>

      {/* Holdings */}
      {affectedHoldings.length > 0 && (
        <div className="mb-4">
          <span className="text-[10px] text-[var(--text-label)] uppercase tracking-wider block mb-1.5">
            Your Holdings Affected
          </span>
          <div className="flex flex-wrap gap-1.5">
            {affectedHoldings.map((h) => (
              <span key={h} className="text-[11px] font-mono font-medium text-[var(--accent-purple)] bg-[var(--accent-purple-dim)] px-2 py-0.5 rounded">
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {!hasProfile && (
        <Link
          href="/profile"
          className="block text-center py-2 rounded-lg bg-[var(--accent-purple)] text-white text-[12px] font-medium hover:bg-[var(--accent-purple-hover)] transition-colors"
        >
          Set up your profile for personalized impact
        </Link>
      )}
    </div>
  );
}
