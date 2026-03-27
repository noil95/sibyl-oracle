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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] bg-mesh">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className={`${maxWidth} mx-auto px-5`}>
          {/* Top bar */}
          <div className="flex items-center justify-between h-[56px]">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo with gradient */}
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: "var(--gradient-purple)" }}>
                  S
                </div>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "var(--gradient-purple)", filter: "blur(8px)" }} />
              </div>
              <div>
                <span className="text-[15px] font-semibold text-white tracking-tight block">
                  Sibyl Oracle
                </span>
                <span className="text-[10px] text-[var(--accent-purple)] font-medium tracking-wider uppercase">
                  Prediction Markets
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {/* Live indicator with glow */}
              <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[var(--status-up)] live-dot" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--status-up)] blur-sm opacity-60" />
                </div>
                <span className="text-[11px] text-[var(--status-up)] font-semibold">Live</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <DomainNav />
        </div>
      </header>

      {/* ── Content ── */}
      <main className={`${maxWidth} mx-auto px-5 py-8`}>
        {children}
      </main>

      {/* ── Footer ── */}
      {showFooter && (
        <footer className="border-t border-[var(--border-primary)] mt-8">
          <div className={`${maxWidth} mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3`}>
            <p className="text-[11px] text-[var(--text-label)]">
              Predictions are probabilistic estimates, not guarantees.
            </p>
            <div className="flex items-center gap-2">
              {(footerText ?? "FRED · BLS · Yahoo · CoinGecko · EIA · NewsAPI · Reddit").split(" · ").map((s) => (
                <span key={s} className="text-[9px] text-[var(--text-tertiary)] bg-[var(--bg-card)] px-2 py-0.5 rounded-full border border-[var(--border-primary)]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
