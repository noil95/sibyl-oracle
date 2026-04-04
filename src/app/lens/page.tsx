"use client";

import { useState } from "react";
import AppShell from "@/app/components/AppShell";
import LensComparison from "@/app/components/LensComparison";

const KNOWN_SLUGS = [
  "bitcoin",
  "oil-price",
  "sp500",
  "fed-rate",
  "ai-regulation",
  "inflation",
  "unemployment",
  "gdp-growth",
  "housing-prices",
  "nvidia-stock",
  "us-recession",
  "china-gdp",
];

export default function LensPage() {
  const [selectedSlug, setSelectedSlug] = useState(KNOWN_SLUGS[0]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Source Lens</h1>
          </div>
          <p className="text-[13px] text-[var(--text-tertiary)] max-w-lg">
            Disaggregate a prediction into its contributing sources. See where signals agree or diverge.
          </p>
        </div>

        {/* Prediction picker */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
            Select Prediction
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-violet-500 min-w-[220px]"
          >
            {KNOWN_SLUGS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Lens comparison */}
        <LensComparison slug={selectedSlug} />
      </div>
    </AppShell>
  );
}
