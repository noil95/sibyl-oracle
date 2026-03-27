"use client";

import { useEffect, useState } from "react";
import GenericPredictionCard from "./GenericPredictionCard";
import Link from "next/link";

interface PredictionType {
  id: string;
  domain: string;
  slug: string;
  name: string;
  description: string;
  refresh_tier: string;
}

interface DomainPrediction {
  predictionType: PredictionType;
  prediction: {
    score: number;
    direction: string;
    confidence: number;
    win_probability: number;
    computed_at: string;
  } | null;
}

const FILTERS = [
  { key: "all" as const, label: "All Markets", icon: "M4 6h16M4 12h16M4 18h16" },
  { key: "economic" as const, label: "Economy", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
  { key: "tech" as const, label: "Tech", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];

export default function PredictionFeed() {
  const [predictions, setPredictions] = useState<DomainPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "economic" | "tech">("all");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [econRes, techRes] = await Promise.all([
          fetch("/api/predictions?domain=economic"),
          fetch("/api/predictions?domain=tech"),
        ]);

        const econData = econRes.ok ? await econRes.json() : { domainPredictions: [] };
        const techData = techRes.ok ? await techRes.json() : { domainPredictions: [] };

        setPredictions([
          ...(econData.domainPredictions || []),
          ...(techData.domainPredictions || []),
        ]);
      } catch (err) {
        console.error("Error loading feed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[140px] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? predictions
      : predictions.filter((p) => p.predictionType.domain === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (a.prediction && !b.prediction) return -1;
    if (!a.prediction && b.prediction) return 1;
    if (a.prediction && b.prediction) {
      const aDist = Math.abs((a.prediction.score ?? a.prediction.win_probability) - 0.5);
      const bDist = Math.abs((b.prediction.score ?? b.prediction.win_probability) - 0.5);
      return bDist - aDist;
    }
    return 0;
  });

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
              filter === f.key
                ? "bg-[var(--accent-purple)] text-white shadow-lg shadow-purple-500/20"
                : "bg-[var(--bg-card)] text-[var(--text-tertiary)] border border-[var(--border-primary)] hover:text-white hover:border-[var(--border-hover)]"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d={f.icon} />
            </svg>
            {f.label}
          </button>
        ))}

        <Link
          href="/politics"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-[var(--bg-card)] text-[var(--text-tertiary)] border border-[var(--border-primary)] hover:text-white hover:border-[var(--border-hover)] transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Politics
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
          <span className="text-[11px] text-[var(--text-label)] number-display">
            {sorted.length} market{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] text-[14px] font-medium">No predictions yet</p>
          <p className="text-[var(--text-label)] text-[12px] mt-1">Run the cron jobs to start generating live data</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((item) => (
            <GenericPredictionCard
              key={item.predictionType.id}
              name={item.predictionType.name}
              slug={item.predictionType.slug}
              domain={item.predictionType.domain as "economic" | "tech"}
              score={item.prediction?.score ?? item.prediction?.win_probability ?? 0.5}
              direction={(item.prediction?.direction as "up" | "down" | "stable") ?? "stable"}
              confidence={item.prediction?.confidence ?? 0}
              description={item.predictionType.description}
              refreshTier={item.predictionType.refresh_tier}
            />
          ))}
        </div>
      )}
    </div>
  );
}
