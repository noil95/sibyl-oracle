"use client";

import Link from "next/link";

interface Tournament {
  id: string;
  title: string;
  prediction_slug: string;
  description: string;
  closes_at: string;
  status: string;
  participantCount: number;
}

interface TournamentCardProps {
  tournament: Tournament;
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

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const timeRemaining = getTimeRemaining(tournament.closes_at);
  const isActive = tournament.status === "open";

  return (
    <Link href={`/tournaments/${tournament.id}`} className="block group">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 card-hover relative overflow-hidden h-full flex flex-col">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

        {/* Status + participants row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isActive ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--status-up)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-up)] live-dot" />
                Active
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                {tournament.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[11px] font-semibold text-violet-400">
              {tournament.participantCount}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-[var(--text-primary)] leading-snug mb-2 group-hover:text-white transition-colors">
          {tournament.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed flex-1 mb-4">
          {truncate(tournament.description, 120)}
        </p>

        {/* Time remaining */}
        <div className="flex items-center gap-1.5 mt-auto">
          <svg className="w-3.5 h-3.5 text-[var(--text-tertiary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`text-[12px] font-medium ${timeRemaining === "Closed" ? "text-[var(--text-tertiary)]" : "text-[var(--status-neutral)]"}`}>
            {timeRemaining}
          </span>
        </div>
      </div>
    </Link>
  );
}
