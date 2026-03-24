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
  low: "border-emerald-500/20 bg-emerald-500/5",
  medium: "border-amber-500/20 bg-amber-500/5",
  high: "border-rose-500/20 bg-rose-500/5",
};

const DIRECTION_ICONS: Record<string, { icon: string; color: string }> = {
  positive: { icon: "^", color: "text-emerald-400" },
  negative: { icon: "v", color: "text-rose-400" },
  neutral: { icon: "-", color: "text-amber-400" },
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
        <label className="text-sm text-white/40 font-medium">
          Your industry:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SECTORS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSector(s.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                sector === s.value
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/[0.02] text-white/30 border border-white/5 hover:bg-white/5 hover:text-white/50"
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
              className={`border rounded-xl p-4 transition-all ${
                SEVERITY_STYLES[impact.severity] ?? SEVERITY_STYLES.medium
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${dir.color}`}
                >
                  {dir.icon}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white/50">
                    {candidateName}
                  </p>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {impact.statement}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {impacts.length === 0 && (
          <div className="text-center py-8 text-white/20 text-sm">
            Impact analysis will appear once predictions are available.
          </div>
        )}
      </div>
    </div>
  );
}
