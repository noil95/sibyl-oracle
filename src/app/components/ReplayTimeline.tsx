"use client";

import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

interface HistoryEntry {
  computed_at: string;
  score?: number;
  win_probability?: number;
}

interface InflectionPoint {
  timestamp: string;
  delta: number;
  commentary: string | null;
}

interface ReplayData {
  history: HistoryEntry[];
  inflections: InflectionPoint[];
}

interface ReplayTimelineProps {
  slug: string;
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ReplayTimeline({ slug }: ReplayTimelineProps) {
  const [data, setData] = useState<ReplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrubIndex, setScrubIndex] = useState(0);
  const [activeCommentary, setActiveCommentary] = useState<string | null>(null);
  const inflectionTimestamps = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/replay/${slug}`);
        if (!res.ok) throw new Error("Failed to load replay");
        const json: ReplayData = await res.json();
        setData(json);
        setScrubIndex(json.history.length > 0 ? json.history.length - 1 : 0);
        inflectionTimestamps.current = new Set(json.inflections.map((i) => i.timestamp));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  function handleScrub(idx: number) {
    setScrubIndex(idx);
    if (!data) return;

    const entry = data.history[idx];
    const inflection = data.inflections.find((i) => i.timestamp === entry?.computed_at);
    setActiveCommentary(inflection?.commentary ?? null);
  }

  if (loading) {
    return (
      <div className="h-[280px] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shimmer" />
    );
  }

  if (error) {
    return (
      <div className="h-[200px] flex items-center justify-center text-[var(--text-tertiary)] text-sm">
        {error}
      </div>
    );
  }

  if (!data || data.history.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-[var(--text-tertiary)] text-sm">
        No history available yet
      </div>
    );
  }

  const chartData = data.history.map((h, i) => ({
    index: i,
    time: formatTime(h.computed_at),
    score: Math.round(((h.score ?? h.win_probability ?? 0)) * 100),
    isInflection: inflectionTimestamps.current.has(h.computed_at),
    timestamp: h.computed_at,
  }));

  const visibleData = chartData.slice(0, scrubIndex + 1);

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
        <div className="w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visibleData} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
              <XAxis
                dataKey="time"
                stroke="var(--border-primary)"
                tick={{ fill: "var(--text-label)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                stroke="var(--border-primary)"
                tick={{ fill: "var(--text-label)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                formatter={(value) => [`${value}%`, "Score"]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
                animationDuration={300}
              />
              {/* Inflection dots */}
              {visibleData
                .filter((d) => d.isInflection)
                .map((d) => (
                  <ReferenceDot
                    key={d.timestamp}
                    x={d.time}
                    y={d.score}
                    r={5}
                    fill="#f59e0b"
                    stroke="#78350f"
                    strokeWidth={1}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Scrubber */}
        <div className="mt-4 px-1">
          <input
            type="range"
            min={0}
            max={data.history.length - 1}
            value={scrubIndex}
            onChange={(e) => handleScrub(Number(e.target.value))}
            className="w-full accent-violet-500 cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[var(--text-tertiary)]">
              {formatTime(data.history[0].computed_at)}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)]">
              {formatTime(data.history[scrubIndex]?.computed_at ?? data.history[0].computed_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Inflection commentary */}
      {activeCommentary && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-widest text-amber-400 font-medium mb-1">
            Inflection Point
          </p>
          <p className="text-[13px] text-[var(--text-primary)]">{activeCommentary}</p>
        </div>
      )}

      {/* Inflection legend */}
      <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <span>Inflection point (&gt;5% shift) — scrub to reveal commentary</span>
      </div>
    </div>
  );
}
