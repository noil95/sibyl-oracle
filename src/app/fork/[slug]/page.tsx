"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "../../components/AppShell";
import ForkSlider from "../../components/ForkSlider";
import ForkView, { type ForkResult } from "../../components/ForkView";

const KNOWN_SLUGS = [
  "fed-rate",
  "bitcoin",
  "sp500",
  "oil-price",
  "inflation",
  "gold-price",
  "dollar-strength",
  "unemployment",
  "gdp-growth",
  "housing-market",
  "ai-regulation",
  "tech-layoffs",
  "ethereum",
];

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface Override {
  slug: string;
  value: number;
}

export default function ForkPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";

  const [mainValue, setMainValue] = useState(0.5);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [results, setResults] = useState<ForkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerSlug, setPickerSlug] = useState<string>("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Available slugs for the picker (excluding already-added ones and the main slug)
  const usedSlugs = new Set([slug, ...overrides.map((o) => o.slug)]);
  const availableSlugs = KNOWN_SLUGS.filter((s) => !usedSlugs.has(s));

  function buildOverridesMap(): Record<string, number> {
    const map: Record<string, number> = { [slug]: mainValue };
    for (const o of overrides) {
      map[o.slug] = o.value;
    }
    return map;
  }

  async function fetchFork(overridesMap: Record<string, number>) {
    setLoading(true);
    setError(null);
    try {
      const encoded = encodeURIComponent(JSON.stringify(overridesMap));
      const res = await fetch(`/api/fork?overrides=${encoded}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = (await res.json()) as { forkResults: ForkResult[] };
      setResults(data.forkResults ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch fork results");
    } finally {
      setLoading(false);
    }
  }

  function scheduleUpdate(overridesMap: Record<string, number>) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchFork(overridesMap);
    }, 300);
  }

  // Re-fetch whenever main value or overrides change
  useEffect(() => {
    if (!slug) return;
    scheduleUpdate(buildOverridesMap());
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, mainValue, overrides]);

  function handleMainChange(value: number) {
    setMainValue(value);
  }

  function handleOverrideChange(targetSlug: string, value: number) {
    setOverrides((prev) =>
      prev.map((o) => (o.slug === targetSlug ? { ...o, value } : o))
    );
  }

  function handleAddOverride() {
    const target = pickerSlug || availableSlugs[0];
    if (!target) return;
    setOverrides((prev) => [...prev, { slug: target, value: 0.5 }]);
    setPickerSlug("");
  }

  function handleRemoveOverride(targetSlug: string) {
    setOverrides((prev) => prev.filter((o) => o.slug !== targetSlug));
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-purple-dim)" }}
            >
              <svg
                className="w-4 h-4"
                style={{ color: "var(--accent-purple)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 6l4-4 4 4M8 18l4 4 4-4M3 12h18" />
              </svg>
            </div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">
              What If?{" "}
              <span style={{ color: "var(--accent-purple)" }}>
                {formatSlug(slug)}
              </span>
            </h1>
          </div>
          <p className="text-[13px] text-[var(--text-tertiary)]">
            Drag sliders to model alternative scenarios and see downstream impact.
          </p>
        </div>

        {/* Main slider */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
            Primary Override
          </h2>
          <ForkSlider
            slug={slug}
            label={formatSlug(slug)}
            currentValue={mainValue}
            onChange={handleMainChange}
          />
        </section>

        {/* Additional overrides */}
        {overrides.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
              Additional Overrides
            </h2>
            {overrides.map((o) => (
              <div key={o.slug} className="relative">
                <ForkSlider
                  slug={o.slug}
                  label={formatSlug(o.slug)}
                  currentValue={o.value}
                  onChange={(v) => handleOverrideChange(o.slug, v)}
                />
                <button
                  onClick={() => handleRemoveOverride(o.slug)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label={`Remove ${formatSlug(o.slug)} override`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </section>
        )}

        {/* Add override controls (max 4 additional) */}
        {overrides.length < 4 && availableSlugs.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={pickerSlug}
              onChange={(e) => setPickerSlug(e.target.value)}
              className="flex-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
            >
              <option value="">Select prediction…</option>
              {availableSlugs.map((s) => (
                <option key={s} value={s}>
                  {formatSlug(s)}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddOverride}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors"
              style={{ background: "var(--accent-purple)" }}
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "var(--accent-purple-hover)")
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "var(--accent-purple)")
              }
            >
              + Add Override
            </button>
          </div>
        )}

        {/* Results */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
              Downstream Impact
            </h2>
            {loading && (
              <span className="text-[11px] text-[var(--text-tertiary)] animate-pulse">
                Calculating…
              </span>
            )}
          </div>

          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-[13px]">{error}</p>
            </div>
          ) : (
            <ForkView results={results} />
          )}
        </section>
      </div>
    </AppShell>
  );
}
