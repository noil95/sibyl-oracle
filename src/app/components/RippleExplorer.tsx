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
  high: { label: "High", gradient: "from-red-500 to-rose-500", bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
  medium: { label: "Medium", gradient: "from-amber-500 to-yellow-500", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  low: { label: "Low", gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
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
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[80px] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (chains.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] text-[14px] font-medium">No ripple chains available</p>
        <p className="text-[var(--text-label)] text-[12px] mt-1">Run the cron jobs to generate prediction data</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chains.map((chain) => {
        const vol = volatilityConfig[chain.volatility];
        const triggerPct = Math.round(chain.triggerScore * 100);

        return (
          <button
            key={chain.id}
            onClick={() => onSelectChain(chain.id)}
            className="w-full text-left group glass-card rounded-xl p-4 card-hover flex items-center gap-4"
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl ${vol.bg} border ${vol.border} flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
              {chain.emoji}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[14px] font-semibold text-white truncate">{chain.name}</h3>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${vol.text} ${vol.bg} border ${vol.border} flex-shrink-0 uppercase tracking-wider`}>
                  {vol.label}
                </span>
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] truncate">{chain.description}</p>
            </div>

            {/* Trigger score */}
            <div className="flex-shrink-0 text-right">
              <div className="text-[22px] font-bold text-white number-display">
                {triggerPct}<span className="text-[12px] text-[var(--text-tertiary)] ml-0.5">¢</span>
              </div>
              <div className="text-[10px] text-[var(--text-label)]">{chain.nodeCount} nodes</div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center group-hover:bg-[var(--accent-purple)] transition-colors">
              <svg className="w-4 h-4 text-[var(--text-label)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
