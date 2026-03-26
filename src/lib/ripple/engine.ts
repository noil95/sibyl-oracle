// Ripple Engine — calculates cause-and-effect prediction chains
// Takes a chain definition + live prediction scores, outputs downstream deltas

import rippleChainsData from "./data/ripple-chains.json";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ── Types ──

export interface ChainNodeConfig {
  slug: string;
  role: "trigger" | "downstream";
  multiplier: number;
  lag_label: string;
  explanation: string;
}

export interface PersonalImpactConfig {
  default: string;
  housing_owner?: string;
  housing_renter?: string;
  stocks_affected: string[];
  crypto_affected: string[];
  industry_weights: Record<string, number>;
}

export interface ChainConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  nodes: ChainNodeConfig[];
  personal_impact: PersonalImpactConfig;
}

export interface RippleNode {
  slug: string;
  name: string;
  domain: string;
  description: string;
  liveScore: number;        // actual live score from DB
  rippleDelta: number;       // calculated downstream shift
  adjustedScore: number;     // 0.5 + rippleDelta (what the score "should be" given the chain)
  direction: "up" | "down" | "stable";
  multiplier: number;
  explanation: string;
  lagLabel: string;
  role: "trigger" | "downstream";
}

export interface LivePrediction {
  score: number;
  direction: string;
  name: string;
  domain: string;
  description: string;
}

// ── Chain Loading ──

export function getAllChains(): ChainConfig[] {
  return (rippleChainsData as unknown as { chains: ChainConfig[] }).chains;
}

export function getChainById(chainId: string): ChainConfig | undefined {
  return getAllChains().find((c) => c.id === chainId);
}

export function getChainsForSlug(slug: string): ChainConfig[] {
  return getAllChains().filter((c) =>
    c.nodes.some((n) => n.slug === slug)
  );
}

// ── Ripple Calculation ──

/**
 * Calculate the ripple effect through a cause-and-effect chain.
 *
 * Algorithm:
 * 1. The trigger node's impulse = (live_score - 0.5)
 *    e.g., score 0.7 = +0.2 impulse (strongly bullish)
 * 2. Each downstream node: cumulative_shift = parent_shift × multiplier
 *    Negative multiplier = inverse relationship
 * 3. Signal naturally attenuates because |multiplier| < 1
 */
export function calculateRippleChain(
  chain: ChainConfig,
  livePredictions: Map<string, LivePrediction>
): RippleNode[] {
  const nodes: RippleNode[] = [];
  let cumulativeShift = 0;

  for (let i = 0; i < chain.nodes.length; i++) {
    const nodeConfig = chain.nodes[i];
    const live = livePredictions.get(nodeConfig.slug);
    const liveScore = live?.score ?? 0.5;

    // Calculate the ripple delta
    if (i === 0) {
      // Trigger node: impulse is distance from neutral
      cumulativeShift = liveScore - 0.5;
    } else {
      // Downstream node: multiply parent's shift by this node's multiplier
      cumulativeShift = cumulativeShift * nodeConfig.multiplier;
    }

    const adjustedScore = clamp(0.5 + cumulativeShift, 0.05, 0.95);

    let direction: "up" | "down" | "stable" = "stable";
    if (adjustedScore > 0.55) direction = "up";
    else if (adjustedScore < 0.45) direction = "down";

    nodes.push({
      slug: nodeConfig.slug,
      name: live?.name ?? nodeConfig.slug,
      domain: live?.domain ?? "unknown",
      description: live?.description ?? "",
      liveScore,
      rippleDelta: cumulativeShift,
      adjustedScore,
      direction,
      multiplier: nodeConfig.multiplier,
      explanation: nodeConfig.explanation,
      lagLabel: nodeConfig.lag_label,
      role: nodeConfig.role,
    });
  }

  return nodes;
}

/**
 * Get a summary of a chain with just the trigger score.
 * Used for the chain listing/explorer view.
 */
export function getChainSummary(
  chain: ChainConfig,
  livePredictions: Map<string, LivePrediction>
) {
  const triggerSlug = chain.nodes[0]?.slug;
  const triggerLive = livePredictions.get(triggerSlug);
  const triggerScore = triggerLive?.score ?? 0.5;
  const triggerImpulse = Math.abs(triggerScore - 0.5);

  // Volatility = how far the trigger is from neutral
  let volatility: "high" | "medium" | "low" = "low";
  if (triggerImpulse > 0.15) volatility = "high";
  else if (triggerImpulse > 0.05) volatility = "medium";

  return {
    id: chain.id,
    name: chain.name,
    emoji: chain.emoji,
    description: chain.description,
    nodeCount: chain.nodes.length,
    triggerSlug,
    triggerScore,
    triggerName: triggerLive?.name ?? triggerSlug,
    volatility,
  };
}
