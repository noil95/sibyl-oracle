"use client";

import { useEffect, useState } from "react";

interface ChainSummary {
  id: string;
  name: string;
  emoji: string;
  description: string;
  nodeCount: number;
  triggerSlug: string;
  triggerScore: number;
  triggerName: string;
  volatility: "high" | "medium" | "low";
}

interface RippleExplorerProps {
  onSelectChain: (chainId: string) => void;
}

const volatilityConfig = {
  high: { label: "High Vol", color: "text-[var(--status-down)]", bg: "bg-[var(--status-down-dim)]" },
  medium: { label: "Med Vol", color: "text-[var(--status-neutral)]", bg: "bg-[var(--status-neutral-dim)]" },
  low: { label: "Low Vol", color: "text-[var(--status-up)]", bg: "bg-[var(--status-up-dim)]" },
};

export default function RippleExplorer({ onSelectChain }: RippleExplorerProps) {
  const [chains, setChains] = useState<ChainSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChains() {
      try {
        const res = await fetch("/api/ripples");
        if (!res.ok) throw new Error("Failed to fetch chains");
        const data = await res.json();
        setChains(data.chains ?? []);
      } catch (err) {
        console.error("Error loading ripple chains:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChains();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-5 h-5 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
      </div>
    );
  }

  if (chains.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-tertiary)] text-[14px]">
        No ripple chains available. Run the cron jobs to generate prediction data.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chains.map((chain) => {
        const vol = volatilityConfig[chain.volatility];
        const triggerPct = Math.round(chain.triggerScore * 100);

        return (
          <button
            key={chain.id}
            onClick={() => onSelectChain(chain.id)}
            className="w-full text-left bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg p-4 card-hover flex items-center gap-4"
          >
            {/* Emoji */}
            <span className="text-2xl flex-shrink-0 w-10 text-center">{chain.emoji}</span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[14px] font-medium text-white truncate">{chain.name}</h3>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${vol.color} ${vol.bg} flex-shrink-0`}>
                  {vol.label}
                </span>
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] truncate">{chain.description}</p>
            </div>

            {/* Trigger score */}
            <div className="flex-shrink-0 text-right">
              <div className="text-[20px] font-bold text-white number-display">
                {triggerPct}<span className="text-[13px] text-[var(--text-tertiary)]">¢</span>
              </div>
              <div className="text-[10px] text-[var(--text-label)]">{chain.nodeCount} nodes</div>
            </div>

            {/* Arrow */}
            <span className="text-[var(--text-label)] flex-shrink-0 text-lg">&rsaquo;</span>
          </button>
        );
      })}
    </div>
  );
}
