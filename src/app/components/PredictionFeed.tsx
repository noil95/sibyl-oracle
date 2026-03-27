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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-5 h-5 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
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
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-[var(--border-primary)] mb-6">
        {[
          { key: "all" as const, label: "All" },
          { key: "economic" as const, label: "Economy" },
          { key: "tech" as const, label: "Tech" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors ${
              filter === f.key
                ? "text-white"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {f.label}
            {filter === f.key && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--accent-purple)]" />
            )}
          </button>
        ))}

        <Link
          href="/politics"
          className="px-4 py-2.5 text-[13px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Politics
        </Link>

        <div className="ml-auto text-[12px] text-[var(--text-label)]">
          {sorted.length} market{sorted.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-tertiary)] text-[14px]">
          No predictions yet. Run the cron job to start generating data.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
