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

export default function EconomicPage() {
  const [predictions, setPredictions] = useState<DomainPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/predictions?domain=economic");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPredictions(data.domainPredictions || []);
      } catch (err) {
        console.error("Error loading economic predictions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AppShell showFooter footerText="FRED · BLS · Yahoo · CoinGecko · EIA">
      {/* Page header */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-[24px] font-bold text-white tracking-tight">Economy</h2>
            </div>
            <p className="text-[13px] text-[var(--text-tertiary)]">
              Market trends, rates, inflation, commodities
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            {["FRED", "BLS", "Yahoo", "CoinGecko", "EIA"].map((s) => (
              <span key={s} className="text-[10px] text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[160px] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shimmer" />
          ))}
        </div>
      ) : predictions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] text-[14px] font-medium">No economic predictions yet</p>
          <p className="text-[var(--text-label)] text-[12px] mt-1">Run the cron job to generate data</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((item) => (
            <GenericPredictionCard
              key={item.predictionType.id}
              name={item.predictionType.name}
              slug={item.predictionType.slug}
              domain="economic"
              score={item.prediction?.score ?? item.prediction?.win_probability ?? 0.5}
              direction={(item.prediction?.direction as "up" | "down" | "stable") ?? "stable"}
              confidence={item.prediction?.confidence ?? 0}
              description={item.predictionType.description}
              refreshTier={item.predictionType.refresh_tier}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
