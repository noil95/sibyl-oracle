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
    <AppShell>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-5 h-5 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[22px] font-semibold text-white tracking-tight">Tech</h2>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                AI regulation, stock trends, crypto, industry shifts
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {["Yahoo", "CoinGecko", "NewsAPI", "Reddit"].map((s) => (
                <span key={s} className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {predictions.length === 0 ? (
            <div className="text-center py-20 text-[var(--text-tertiary)] text-[14px]">
              No tech predictions yet. Run the cron job to generate data.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
