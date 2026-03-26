"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import DomainNav from "../components/DomainNav";
import RippleExplorer from "../components/RippleExplorer";
import RippleChainView from "../components/RippleChainView";

function RipplesContent() {
  const searchParams = useSearchParams();
  const initialChain = searchParams.get("chain");
  const [selectedChain, setSelectedChain] = useState<string | null>(initialChain);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {selectedChain ? (
        <RippleChainView
          chainId={selectedChain}
          onBack={() => setSelectedChain(null)}
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Ripple Effects
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] max-w-lg">
              See how predictions connect in cause-and-effect chains. Each ripple shows how one event cascades into others — and how it impacts you.
            </p>
          </div>

          <RippleExplorer onSelectChain={setSelectedChain} />
        </div>
      )}
    </main>
  );
}

export default function RipplesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] bg-subtle">
      <header className="border-b border-[var(--border-primary)] px-4 sm:px-6 py-4 sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-purple)] flex items-center justify-center text-sm font-bold text-white">
                S
              </div>
              <div>
                <h1 className="text-base font-semibold text-[var(--text-primary)]">
                  Sibyl Oracle
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-label)]">
                  Ripple Effects
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-primary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-up)] live-dot" />
              <span className="text-[10px] text-[var(--text-label)] font-medium">Live</span>
            </div>
          </div>
          <DomainNav />
        </div>
      </header>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin w-8 h-8 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
            <p className="text-sm text-[var(--text-tertiary)]">Loading...</p>
          </div>
        }
      >
        <RipplesContent />
      </Suspense>
    </div>
  );
}
