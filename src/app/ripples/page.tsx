"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "../components/AppShell";
import RippleExplorer from "../components/RippleExplorer";
import RippleChainView from "../components/RippleChainView";

function RipplesContent() {
  const searchParams = useSearchParams();
  const initialChain = searchParams.get("chain");
  const [selectedChain, setSelectedChain] = useState<string | null>(initialChain);

  return selectedChain ? (
    <RippleChainView
      chainId={selectedChain}
      onBack={() => setSelectedChain(null)}
    />
  ) : (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-[24px] font-bold text-white tracking-tight">
            Ripple Effects
          </h2>
        </div>
        <p className="text-[13px] text-[var(--text-tertiary)] max-w-lg">
          See how predictions connect in cause-and-effect chains. Each ripple shows how one event cascades into others.
        </p>
      </div>

      <RippleExplorer onSelectChain={setSelectedChain} />
    </div>
  );
}

export default function RipplesPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[80px] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shimmer" />
            ))}
          </div>
        }
      >
        <RipplesContent />
      </Suspense>
    </AppShell>
  );
}
