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
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Ripple Effects
        </h2>
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
    <AppShell subtitle="Ripple Effects">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin w-6 h-6 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
            <p className="text-xs text-[var(--text-tertiary)]">Loading...</p>
          </div>
        }
      >
        <RipplesContent />
      </Suspense>
    </AppShell>
  );
}
