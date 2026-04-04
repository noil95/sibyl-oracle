"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/app/components/AppShell";
import ReplayTimeline from "@/app/components/ReplayTimeline";

interface PredictionType {
  name: string;
  slug: string;
  score?: number;
  win_probability?: number;
}

export default function ReplayPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : (params.slug?.[0] ?? "");

  const [predType, setPredType] = useState<PredictionType | null>(null);
  const [currentScore, setCurrentScore] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function loadInfo() {
      try {
        const res = await fetch(`/api/replay/${slug}`);
        if (!res.ok) return;
        const data = await res.json();
        const history = data.history ?? [];
        if (history.length > 0) {
          const latest = history[history.length - 1];
          setCurrentScore(latest.score ?? latest.win_probability ?? null);
        }
        // Use slug as display name fallback
        setPredType({ name: slug.replace(/-/g, " "), slug });
      } catch {
        // ignore
      }
    }

    loadInfo();
  }, [slug]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-[24px] font-bold text-white tracking-tight capitalize">
              {predType ? predType.name : slug.replace(/-/g, " ")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[13px] text-[var(--text-tertiary)]">
              Simulation Replay — scrub through history to see inflection points
            </p>
            {currentScore !== null && (
              <span className="text-[13px] font-semibold text-violet-400">
                Current: {Math.round(currentScore * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Timeline */}
        {slug && <ReplayTimeline slug={slug} />}
      </div>
    </AppShell>
  );
}
