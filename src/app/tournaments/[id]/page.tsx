"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "../../components/AppShell";
import PredictionSlider from "../../components/PredictionSlider";

interface Tournament {
  id: string;
  title: string;
  prediction_slug: string;
  description: string;
  closes_at: string;
  status: string;
  participantCount: number;
  outcome?: number | null;
  user_brier?: number | null;
}

function getTimeRemaining(closesAt: string): string {
  const now = Date.now();
  const end = new Date(closesAt).getTime();
  const diff = end - now;

  if (diff <= 0) return "Closed";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchTournament() {
      try {
        const res = await fetch("/api/tournaments");
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        const found = (data.tournaments ?? []).find((t: Tournament) => t.id === id);
        if (!found) throw new Error("Tournament not found");
        setTournament(found);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load tournament");
      } finally {
        setLoading(false);
      }
    }

    fetchTournament();
  }, [id]);

  return (
    <AppShell maxWidth="max-w-2xl">
      {loading && (
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded-lg bg-[var(--bg-card)] shimmer" />
          <div className="h-4 w-full rounded-lg bg-[var(--bg-card)] shimmer" />
          <div className="h-48 rounded-xl bg-[var(--bg-card)] shimmer" />
        </div>
      )}

      {error && (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-[var(--status-down)] text-[14px]">{error}</p>
        </div>
      )}

      {!loading && !error && tournament && (
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[12px] text-[var(--text-tertiary)]">
            <a href="/tournaments" className="hover:text-[var(--text-secondary)] transition-colors">
              Tournaments
            </a>
            <span>/</span>
            <span className="text-[var(--text-secondary)] truncate max-w-[200px]">{tournament.title}</span>
          </nav>

          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-[22px] font-bold text-white leading-tight">{tournament.title}</h1>
              <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[12px] font-semibold text-violet-400">{tournament.participantCount} participants</span>
              </div>
            </div>
            <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{tournament.description}</p>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Status */}
            <div className="flex items-center gap-1.5">
              {tournament.status === "open" ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[var(--status-up)] live-dot" />
                  <span className="text-[12px] font-semibold text-[var(--status-up)]">Active</span>
                </>
              ) : (
                <span className="text-[12px] font-semibold text-[var(--text-tertiary)] capitalize">{tournament.status}</span>
              )}
            </div>

            {/* Time */}
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[12px] text-[var(--text-secondary)]">{getTimeRemaining(tournament.closes_at)}</span>
            </div>
          </div>

          {/* Resolved outcome */}
          {tournament.status === "resolved" && tournament.outcome !== undefined && tournament.outcome !== null && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)] mb-3">Resolution</p>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="text-[28px] font-black"
                  style={{ color: tournament.outcome >= 0.5 ? "var(--status-up)" : "var(--status-down)" }}
                >
                  {tournament.outcome >= 0.5 ? "YES" : "NO"}
                </div>
                <div className="text-[var(--text-secondary)] text-[13px]">
                  Outcome resolved at{" "}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {Math.round(tournament.outcome * 100)}%
                  </span>
                </div>
              </div>

              {tournament.user_brier !== undefined && tournament.user_brier !== null && (
                <div className="border-t border-[var(--border-primary)] pt-3">
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    Your Brier score:{" "}
                    <span className="font-bold text-violet-400 number-display">
                      {tournament.user_brier.toFixed(4)}
                    </span>
                    <span className="text-[var(--text-tertiary)] ml-1">(lower = better)</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Prediction slider — only when open */}
          {tournament.status === "open" && (
            <div className="space-y-3">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-violet-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Your Prediction
              </h2>
              <PredictionSlider tournamentId={tournament.id} />
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
