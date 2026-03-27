"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
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
    <AppShell subtitle="Tech Predictions">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
          <p className="text-xs text-[var(--text-tertiary)]">Loading tech predictions...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
              Tech Predictions
            </h2>
            <p className="text-[13px] text-[var(--text-tertiary)]">
              AI regulation, stock trends, crypto movements, and industry shifts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-label)] font-medium">Sources</span>
            {["Yahoo", "CoinGecko", "NewsAPI", "Reddit"].map((s) => (
              <span
                key={s}
                className="text-[9px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded font-medium"
              >
                {s}
              </span>
            ))}
          </div>

          {predictions.length === 0 ? (
            <div className="text-center py-20">
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
    </AppShell>
  );
}
