"use client";

import DomainNav from "./DomainNav";

interface AppShellProps {
  children: React.ReactNode;
  subtitle?: string;
  maxWidth?: string;
  showFooter?: boolean;
  footerText?: string;
}

export default function AppShell({
  children,
  subtitle = "AI-Powered Predictions",
  maxWidth = "max-w-6xl",
  showFooter = false,
  footerText,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] bg-subtle">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className={`${maxWidth} mx-auto px-4 sm:px-6`}>
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-purple)] flex items-center justify-center text-xs font-bold text-white">
                S
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                  Sibyl Oracle
                </span>
                <span className="hidden sm:inline text-[10px] text-[var(--text-label)] uppercase tracking-widest">
                  {subtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[var(--text-label)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-up)] live-dot" />
              <span className="font-medium uppercase tracking-wider">Live</span>
            </div>
          </div>

          <DomainNav />
        </div>
      </header>

      {/* ── Content ── */}
      <main className={`${maxWidth} mx-auto px-4 sm:px-6 py-8`}>
        {children}
      </main>

      {/* ── Footer ── */}
      {showFooter && (
        <footer className="border-t border-[var(--border-primary)] mt-12">
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3`}>
            <p className="text-[11px] text-[var(--text-label)]">
              Predictions are probabilistic estimates, not guarantees.
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {footerText ?? "Powered by FRED, BLS, Yahoo Finance, CoinGecko, EIA, NewsAPI, Reddit"}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
