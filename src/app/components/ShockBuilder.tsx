"use client";

import { useState } from "react";

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
];

interface ShockBuilderProps {
  onResults: (results: unknown[], scenarioName: string) => void;
}

export default function ShockBuilder({ onResults }: ShockBuilderProps) {
  const [selectedSlug, setSelectedSlug] = useState(KNOWN_SLUGS[0]);
  const [value, setValue] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const overrides: Record<string, number> = {
      [selectedSlug]: value / 100,
    };

    try {
      const res = await fetch(
        `/api/redteam?overrides=${encodeURIComponent(JSON.stringify(overrides))}`
      );
      if (!res.ok) throw new Error("Stress test failed");
      const data = await res.json();
      onResults(data.results, `Custom: ${selectedSlug} → ${value}%`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Slug selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
            Prediction
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
          >
            {KNOWN_SLUGS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Value slider */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
            Shock Value: <span className="text-violet-400">{value}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full accent-violet-500 cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[9px] text-[var(--text-tertiary)]">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-[12px]">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
      >
        {loading ? "Running..." : "Run Stress Test"}
      </button>
    </form>
  );
}
