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
  high: { label: "Active", color: "text-[var(--status-down)]" },
  medium: { label: "Shifting", color: "text-[var(--status-neutral)]" },
  low: { label: "Calm", color: "text-[var(--status-up)]" },
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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
        <p className="text-sm text-[var(--text-tertiary)]">Loading ripple chains...</p>
      </div>
    );
  }

  if (chains.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--text-tertiary)] text-sm">
          No ripple chains available. Run the cron jobs to generate prediction data.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {chains.map((chain) => {
        const vol = volatilityConfig[chain.volatility];
        const triggerPct = Math.round(chain.triggerScore * 100);

        return (
          <button
            key={chain.id}
            onClick={() => onSelectChain(chain.id)}
            className="text-left bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 card-hover"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">{chain.emoji}</span>
              <span className={`text-[10px] font-medium uppercase tracking-wider ${vol.color}`}>
                {vol.label}
              </span>
            </div>

            {/* Name + description */}
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              {chain.name}
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mb-3 line-clamp-2">
              {chain.description}
            </p>

            {/* Trigger info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-label)] uppercase tracking-wider">
                  Trigger
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {chain.triggerName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[var(--accent-purple)] tabular-nums">
                  {triggerPct}%
                </span>
                <span className="text-[10px] text-[var(--text-label)]">
                  {chain.nodeCount} nodes
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
