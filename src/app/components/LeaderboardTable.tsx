"use client";

import { useEffect, useState } from "react";
import { getUserId } from "@/lib/user-id";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_brier_sum: number;
  total_resolved: number;
  prediction_count: number;
}

type RankTitle = "Novice" | "Analyst" | "Strategist" | "Oracle";

const RANK_STYLES: Record<RankTitle, { label: string; color: string; bg: string }> = {
  Novice: { label: "Novice", color: "text-[var(--text-secondary)]", bg: "bg-[var(--bg-elevated)]" },
  Analyst: { label: "Analyst", color: "text-blue-400", bg: "bg-blue-500/10" },
  Strategist: { label: "Strategist", color: "text-violet-400", bg: "bg-violet-500/10" },
  Oracle: { label: "Oracle", color: "text-[var(--accent-gold)]", bg: "bg-yellow-500/10" },
};

function getRankTitle(brierAvg: number, resolved: number): RankTitle {
  if (resolved < 3) return "Novice";
  if (brierAvg < 0.1) return "Oracle";
  if (brierAvg < 0.18) return "Strategist";
  if (brierAvg < 0.25) return "Analyst";
  return "Novice";
}

function formatBrier(sum: number, resolved: number): string {
  if (resolved === 0) return "—";
  return (sum / resolved).toFixed(4);
}

export default function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    setCurrentUserId(getUserId());

    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setEntries(data.leaderboard ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-[var(--bg-card)] shimmer" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-[13px] text-[var(--status-down)] text-center py-8">{error}</p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-[13px] text-[var(--text-tertiary)] text-center py-8">
        No predictions resolved yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-primary)]">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-elevated)]">
            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)] w-12">#</th>
            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">Name</th>
            <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">Brier Score</th>
            <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">Predictions</th>
            <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)] hidden sm:table-cell">Rank</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const isCurrentUser = entry.user_id === currentUserId;
            const brierAvg = entry.total_resolved > 0 ? entry.total_brier_sum / entry.total_resolved : 1;
            const rankTitle = getRankTitle(brierAvg, entry.total_resolved);
            const rankStyle = RANK_STYLES[rankTitle];
            const rank = index + 1;

            return (
              <tr
                key={entry.user_id}
                className={`border-b border-[var(--border-primary)] last:border-0 transition-colors ${
                  isCurrentUser
                    ? "bg-violet-500/10"
                    : "hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                {/* Rank */}
                <td className="px-4 py-3">
                  {rank <= 3 ? (
                    <span className={`text-[13px] font-black ${rank === 1 ? "text-[var(--accent-gold)]" : rank === 2 ? "text-[var(--text-secondary)]" : "text-amber-600"}`}>
                      {rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}
                    </span>
                  ) : (
                    <span className="text-[var(--text-tertiary)] font-medium">{rank}</span>
                  )}
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isCurrentUser ? "text-violet-300" : "text-[var(--text-primary)]"}`}>
                      {entry.display_name || "Anonymous"}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[9px] uppercase tracking-widest font-bold text-violet-400 bg-violet-500/20 px-1.5 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </td>

                {/* Brier Score */}
                <td className="px-4 py-3 text-right font-mono font-semibold text-[var(--text-primary)]">
                  {formatBrier(entry.total_brier_sum, entry.total_resolved)}
                </td>

                {/* Predictions */}
                <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                  {entry.prediction_count}
                </td>

                {/* Rank Title */}
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${rankStyle.color} ${rankStyle.bg}`}>
                    {rankStyle.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
