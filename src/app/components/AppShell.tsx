"use client";

import Link from "next/link";
import DomainNav from "./DomainNav";

interface AppShellProps {
  children: React.ReactNode;
  maxWidth?: string;
  showFooter?: boolean;
  footerText?: string;
}

export default function AppShell({
  children,
  maxWidth = "max-w-[1200px]",
  showFooter = false,
  footerText,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
        <div className={`${maxWidth} mx-auto px-5`}>
          {/* Top bar */}
          <div className="flex items-center justify-between h-[52px]">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-purple)] flex items-center justify-center text-sm font-bold text-white">
                S
              </div>
              <span className="text-[15px] font-semibold text-white tracking-tight">
                Sibyl Oracle
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-2.5 py-1 rounded-full">
                <div className="w-[6px] h-[6px] rounded-full bg-[var(--status-up)] live-dot" />
                <span className="text-[11px] text-[var(--text-secondary)] font-medium">Live</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <DomainNav />
        </div>
      </header>

      {/* ── Content ── */}
      <main className={`${maxWidth} mx-auto px-5 py-6`}>
        {children}
      </main>

      {/* ── Footer ── */}
      {showFooter && (
        <footer className="border-t border-[var(--border-primary)]">
          <div className={`${maxWidth} mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2`}>
            <p className="text-[11px] text-[var(--text-label)]">
              Predictions are probabilistic estimates, not guarantees.
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {footerText ?? "FRED · BLS · Yahoo Finance · CoinGecko · EIA · NewsAPI · Reddit"}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
