"use client";

import { useEffect, useState } from "react";
import DominoCard from "./DominoCard";
import PersonalImpactCard from "./PersonalImpactCard";

interface RippleNode {
  slug: string;
  name: string;
  domain: string;
  description: string;
  liveScore: number;
  rippleDelta: number;
  adjustedScore: number;
  direction: "up" | "down" | "stable";
  multiplier: number;
  explanation: string;
  lagLabel: string;
  role: "trigger" | "downstream";
}

interface PersonalImpact {
  headline: string;
  detail: string;
  severity: "low" | "medium" | "high";
  direction: "positive" | "negative" | "neutral";
  relevanceScore: number;
  affectedHoldings: string[];
  hasProfile: boolean;
}

interface ChainData {
  chain: {
    id: string;
    name: string;
    emoji: string;
    description: string;
  };
  nodes: RippleNode[];
  personalImpact: PersonalImpact;
}

interface RippleChainViewProps {
  chainId: string;
  onBack?: () => void;
}

export default function RippleChainView({ chainId, onBack }: RippleChainViewProps) {
  const [data, setData] = useState<ChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChain() {
      try {
        let profileParam = "";
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("sibyl-user-profile");
          if (stored) {
            profileParam = `&profile=${btoa(stored)}`;
          }
        }

        const res = await fetch(`/api/ripples?chain=${chainId}${profileParam}`);
        if (!res.ok) throw new Error("Failed to fetch chain");
        const chainData = await res.json();
        setData(chainData);
      } catch (err) {
        console.error("Error loading ripple chain:", err);
        setError("Failed to load ripple chain");
      } finally {
        setLoading(false);
      }
    }

    fetchChain();
  }, [chainId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
        <p className="text-sm text-[var(--text-tertiary)]">Calculating ripple effects...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--text-tertiary)] text-sm">{error ?? "Chain not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-0">
      {/* Chain header */}
      <div className="text-center mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] mb-3 inline-flex items-center gap-1 transition-colors"
          >
            ← Back to all chains
          </button>
        )}
        <div className="text-2xl mb-2">{data.chain.emoji}</div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{data.chain.name}</h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-md mx-auto">
          {data.chain.description}
        </p>
      </div>

      {/* Domino chain */}
      {data.nodes.map((node, i) => (
        <DominoCard
          key={node.slug}
          name={node.name}
          domain={node.domain}
          liveScore={node.liveScore}
          adjustedScore={node.adjustedScore}
          direction={node.direction}
          multiplier={node.multiplier}
          rippleDelta={node.rippleDelta}
          explanation={node.explanation}
          lagLabel={node.lagLabel}
          role={node.role}
          isFirst={i === 0}
          isLast={i === data.nodes.length - 1}
        />
      ))}

      {/* Personal Impact */}
      <PersonalImpactCard
        headline={data.personalImpact.headline}
        detail={data.personalImpact.detail}
        severity={data.personalImpact.severity}
        direction={data.personalImpact.direction}
        relevanceScore={data.personalImpact.relevanceScore}
        affectedHoldings={data.personalImpact.affectedHoldings}
        hasProfile={data.personalImpact.hasProfile}
      />
    </div>
  );
}
