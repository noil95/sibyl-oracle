"use client";

import { useEffect, useState } from "react";
import SourceCard from "./SourceCard";

interface SourceSignal {
  source: string;
  latestValue: number;
  weight: number;
  fetchedAt: string;
}

interface DisaggregatedView {
  predictionSlug: string;
  sources: SourceSignal[];
  consensusGap: number;
}

interface LensComparisonProps {
  slug: string;
}

function ConsensusIndicator({ gap }: { gap: number }) {
  let color: string;
  let label: string;
  let bgClass: string;
  let borderClass: string;

  if (gap < 0.1) {
    color = "text-emerald-400";
    bgClass = "bg-emerald-500/10";
    borderClass = "border-emerald-500/30";
    label = "Strong agreement";
  } else if (gap <= 0.3) {
    color = "text-amber-400";
    bgClass = "bg-amber-500/10";
    borderClass = "border-amber-500/30";
    label = "Moderate disagreement";
  } else {
    color = "text-red-400";
    bgClass = "bg-red-500/10";
    borderClass = "border-red-500/30";
    label = "High disagreement";
  }

  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${bgClass} ${borderClass}`}>
      <div className="space-y-0.5">
        <p className={`text-[11px] uppercase tracking-widest font-medium ${color}`}>
          Consensus Gap
        </p>
        <p className={`text-[22px] font-bold ${color}`}>
          {Math.round(gap * 100)}%
        </p>
      </div>
      <span className="text-[12px] text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}

export default function LensComparison({ slug }: LensComparisonProps) {
  const [data, setData] = useState<DisaggregatedView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/lens/${slug}`);
        if (!res.ok) throw new Error("Failed to load lens data");
        const json: DisaggregatedView = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[120px] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shimmer"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-[var(--text-tertiary)] text-sm py-8 text-center">{error}</div>
    );
  }

  if (!data || data.sources.length === 0) {
    return (
      <div className="text-[var(--text-tertiary)] text-sm py-8 text-center">
        No source signals available for this prediction
      </div>
    );
  }

  // Detect outliers: value more than 1.5× std-dev from mean
  const values = data.sources.map((s) => s.latestValue);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const outlierSet = new Set(
    data.sources
      .filter((s) => Math.abs(s.latestValue - mean) > 1.5 * stdDev)
      .map((s) => s.source)
  );

  return (
    <div className="space-y-4">
      <ConsensusIndicator gap={data.consensusGap} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.sources.map((source) => (
          <SourceCard
            key={source.source}
            source={source.source}
            value={source.latestValue}
            weight={source.weight}
            fetchedAt={source.fetchedAt}
            isOutlier={outlierSet.has(source.source)}
          />
        ))}
      </div>
    </div>
  );
}
