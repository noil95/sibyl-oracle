"use client";

import { useEffect, useState } from "react";
import DomainNav from "../components/DomainNav";
import GenericPredictionCard from "../components/GenericPredictionCard";

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

export default function TechPage() {
  const [predictions, setPredictions] = useState<DomainPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/predictions?domain=tech");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPredictions(data.domainPredictions || []);
      } catch (err) {
        console.error("Error loading tech predictions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] bg-subtle">
      <header className="border-b border-[var(--border-primary)] px-4 sm:px-6 py-4 sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-purple)] flex items-center justify-center text-sm font-bold text-white">
                S
              </div>
              <div>
                <h1 className="text-base font-semibold text-[var(--text-primary)]">
                  Sibyl Oracle
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-label)]">
                  Tech Predictions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-primary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-up)] live-dot" />
              <span className="text-[10px] text-[var(--text-label)] font-medium">Live</span>
            </div>
          </div>
          <DomainNav />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin w-8 h-8 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
            <p className="text-sm text-[var(--text-tertiary)]">Loading tech predictions...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Tech Predictions
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                AI regulation, stock trends, crypto movements, and industry shifts
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-label)]">
              <span className="uppercase tracking-wider text-[10px]">Sources</span>
              {["Yahoo", "CoinGecko", "NewsAPI", "Reddit"].map((s) => (
                <span
                  key={s}
                  className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]"
                >
                  {s}
                </span>
              ))}
            </div>

            {predictions.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[var(--text-tertiary)] text-sm">
                  No tech predictions yet. Run the tech cron job to generate predictions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictions.map((item) => (
                  <GenericPredictionCard
                    key={item.predictionType.id}
                    name={item.predictionType.name}
                    slug={item.predictionType.slug}
                    domain="tech"
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
        )}
      </main>
    </div>
  );
}
