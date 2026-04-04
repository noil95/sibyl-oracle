"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import TournamentCard from "../components/TournamentCard";

interface Tournament {
  id: string;
  title: string;
  prediction_slug: string;
  description: string;
  closes_at: string;
  status: string;
  participantCount: number;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const res = await fetch("/api/tournaments");
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setTournaments(data.tournaments ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load tournaments");
      } finally {
        setLoading(false);
      }
    }

    fetchTournaments();
  }, []);

  return (
    <AppShell maxWidth="max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-purple)" }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-white tracking-tight">Calibration Tournaments</h1>
        </div>
        <p className="text-[13px] text-[var(--text-tertiary)]">
          Compete on probability calibration. Brier score determines rank — lower is better.
        </p>
      </div>

      {/* Content */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-[var(--bg-card)] shimmer" />
          ))}
        </div>
      )}

      {error && (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-[var(--status-down)] text-[14px]">{error}</p>
        </div>
      )}

      {!loading && !error && tournaments.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] font-semibold mb-1">No active tournaments</p>
          <p className="text-[var(--text-tertiary)] text-[13px]">New tournaments are added regularly. Check back soon.</p>
        </div>
      )}

      {!loading && !error && tournaments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
