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

        const all = [
          ...(econData.domainPredictions || []),
          ...(techData.domainPredictions || []),
        ];

        setPredictions(all);
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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
        <p className="text-sm text-[var(--text-tertiary)]">Loading predictions...</p>
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
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex items-center gap-1">
        {(["all", "economic", "tech"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === f
                ? "bg-[var(--accent-purple-dim)] text-[var(--accent-purple)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
            }`}
          >
            {f === "all" ? "All" : f === "economic" ? "Economy" : "Tech"}
          </button>
        ))}

        <Link
          href="/politics"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
        >
          Politics
        </Link>
      </div>

      {/* Count */}
      <p className="text-xs text-[var(--text-label)]">
        {sorted.length} predictions
      </p>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--text-tertiary)] text-sm">
            No predictions yet. Run the cron job to start generating predictions.
          </p>
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
