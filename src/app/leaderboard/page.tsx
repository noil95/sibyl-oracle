"use client";

import AppShell from "../components/AppShell";
import LeaderboardTable from "../components/LeaderboardTable";

export default function LeaderboardPage() {
  return (
    <AppShell maxWidth="max-w-3xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-gold)" }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-white tracking-tight">Prediction Leaderboard</h1>
        </div>
        <p className="text-[13px] text-[var(--text-tertiary)] max-w-xl">
          Rankings are determined by{" "}
          <span className="text-[var(--text-secondary)] font-medium">Brier score</span> — the mean squared
          error between your probability and the outcome. A score of{" "}
          <span className="text-violet-400 font-medium">0.00</span> is perfect;{" "}
          <span className="text-[var(--status-down)] font-medium">1.00</span> means you were maximally wrong.
          Lower is always better.
        </p>
      </div>

      {/* Rank key */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">Ranks:</span>
        {[
          { title: "Novice", color: "text-[var(--text-secondary)]", bg: "bg-[var(--bg-elevated)]" },
          { title: "Analyst", color: "text-blue-400", bg: "bg-blue-500/10" },
          { title: "Strategist", color: "text-violet-400", bg: "bg-violet-500/10" },
          { title: "Oracle", color: "text-[var(--accent-gold)]", bg: "bg-yellow-500/10" },
        ].map((rank) => (
          <span
            key={rank.title}
            className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full ${rank.color} ${rank.bg}`}
          >
            {rank.title}
          </span>
        ))}
      </div>

      <LeaderboardTable />
    </AppShell>
  );
}
