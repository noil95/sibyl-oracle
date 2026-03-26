"use client";

import { useState, useEffect } from "react";
import { SECTORS, type Sector } from "@/lib/impact/templates";

interface ImpactPanelProps {
  candidates: {
    name: string;
    winProbability: number;
  }[];
}

interface ImpactResult {
  statement: string;
  severity: string;
  direction: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  low: "border-[var(--status-up)]/20 bg-[var(--status-up)]/5",
  medium: "border-[var(--status-neutral)]/20 bg-[var(--status-neutral)]/5",
  high: "border-[var(--status-down)]/20 bg-[var(--status-down)]/5",
};

const DIRECTION_ICONS: Record<string, { icon: string; color: string }> = {
  positive: { icon: "^", color: "text-[var(--status-up)]" },
  negative: { icon: "v", color: "text-[var(--status-down)]" },
  neutral: { icon: "-", color: "text-[var(--status-neutral)]" },
};

export default function ImpactPanel({ candidates }: ImpactPanelProps) {
  const [sector, setSector] = useState<Sector>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sibyl-sector") as Sector) || "tech";
    }
    return "tech";
  });
  const [impacts, setImpacts] = useState<
    { candidateName: string; impact: ImpactResult }[]
  >([]);

  useEffect(() => {
    localStorage.setItem("sibyl-sector", sector);

    async function fetchImpacts() {
      const results = [];
      for (const candidate of candidates) {
        const res = await fetch(
          `/api/impact?candidate=${encodeURIComponent(candidate.name)}&sector=${sector}&probability=${candidate.winProbability}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data) {
            results.push({ candidateName: candidate.name, impact: data });
          }
        }
      }
      setImpacts(results);
    }

    fetchImpacts();
  }, [sector, candidates]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <label className="text-xs text-[var(--text-label)] font-medium">
          Your industry:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SECTORS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSector(s.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                sector === s.value
                  ? "bg-[var(--accent-purple-dim)] text-[var(--accent-purple)]"
                  : "bg-[var(--bg-card)] text-[var(--text-tertiary)] border border-[var(--border-primary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {impacts.map(({ candidateName, impact }) => {
          const dir = DIRECTION_ICONS[impact.direction] ?? DIRECTION_ICONS.neutral;
          return (
            <div
              key={candidateName}
              className={`border rounded-xl p-4 ${
                SEVERITY_STYLES[impact.severity] ?? SEVERITY_STYLES.medium
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${dir.color}`}
                >
                  {dir.icon}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    {candidateName}
                  </p>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                    {impact.statement}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {impacts.length === 0 && (
          <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
            Impact analysis will appear once predictions are available.
          </div>
        )}
      </div>
    </div>
  );
}
