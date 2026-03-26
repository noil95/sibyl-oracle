// Personal Impact Calculator — generates the "YOUR IMPACT" card
// at the end of each ripple chain, personalized to user profile

import type { ChainConfig } from "./engine";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ── Types ──

export interface UserProfile {
  industry?: string;
  job_role?: string;
  city?: string;
  housing?: "owner" | "renter" | string;
  stocks?: string[];
  crypto?: string[];
}

export interface PersonalImpact {
  headline: string;
  detail: string;
  severity: "low" | "medium" | "high";
  direction: "positive" | "negative" | "neutral";
  relevanceScore: number;
  affectedHoldings: string[];
  hasProfile: boolean;
}

// ── Impact Calculation ──

/**
 * Compute a personalized impact statement for a ripple chain.
 *
 * @param chain - The chain configuration with personal_impact templates
 * @param finalDelta - The cumulative ripple delta at the end of the chain
 * @param userProfile - The user's profile (from localStorage)
 */
export function computePersonalImpact(
  chain: ChainConfig,
  finalDelta: number,
  userProfile?: UserProfile
): PersonalImpact {
  const impactConfig = chain.personal_impact;
  const hasProfile = !!userProfile && !!(userProfile.industry || userProfile.housing || (userProfile.stocks && userProfile.stocks.length > 0));

  // 1. Pick the right template based on user profile
  let template = impactConfig.default;
  if (userProfile?.housing === "owner" && impactConfig.housing_owner) {
    template = impactConfig.housing_owner;
  } else if (userProfile?.housing === "renter" && impactConfig.housing_renter) {
    template = impactConfig.housing_renter;
  }

  // 2. Calculate relevance from industry weights
  const userIndustry = userProfile?.industry ?? "Other";
  const industryWeight = impactConfig.industry_weights[userIndustry]
    ?? impactConfig.industry_weights["Other"]
    ?? 0.3;

  // 3. Find affected holdings
  const userStocks = userProfile?.stocks ?? [];
  const userCrypto = userProfile?.crypto ?? [];
  const affectedStocks = (impactConfig.stocks_affected ?? [])
    .filter((s) => userStocks.includes(s));
  const affectedCrypto = (impactConfig.crypto_affected ?? [])
    .filter((c) => userCrypto.includes(c));
  const affectedHoldings = [...affectedStocks, ...affectedCrypto];

  // 4. Boost relevance if user holds affected assets
  const holdingsBoost = affectedHoldings.length > 0 ? 0.2 : 0;
  const relevanceScore = clamp(industryWeight + holdingsBoost, 0, 1);

  // 5. Calculate impact percentage
  const impactPct = Math.max(1, Math.abs(Math.round(finalDelta * 100 * industryWeight)));

  // 6. Determine severity and direction
  const absImpact = Math.abs(finalDelta * industryWeight);
  let severity: "low" | "medium" | "high" = "low";
  if (absImpact > 0.1) severity = "high";
  else if (absImpact > 0.04) severity = "medium";

  let direction: "positive" | "negative" | "neutral" = "neutral";
  if (finalDelta > 0.02) direction = "positive";
  else if (finalDelta < -0.02) direction = "negative";

  // 7. Fill template tokens
  const directionWord = finalDelta > 0 ? "increase" : "decrease";
  const inverseDirectionWord = finalDelta > 0 ? "decrease" : "increase";

  const detail = template
    .replace(/\{impact_pct\}/g, String(impactPct))
    .replace(/\{direction_word\}/g, directionWord)
    .replace(/\{inverse_direction_word\}/g, inverseDirectionWord);

  // 8. Generate headline
  const headline = generateHeadline(chain, direction, severity, userProfile);

  return {
    headline,
    detail,
    severity,
    direction,
    relevanceScore,
    affectedHoldings,
    hasProfile,
  };
}

function generateHeadline(
  chain: ChainConfig,
  direction: "positive" | "negative" | "neutral",
  severity: "low" | "medium" | "high",
  profile?: UserProfile
): string {
  const industry = profile?.industry ?? "your industry";

  if (severity === "high") {
    if (direction === "negative") {
      return `High impact alert for ${industry}`;
    }
    return `Strong positive signal for ${industry}`;
  }

  if (severity === "medium") {
    if (direction === "negative") {
      return `Moderate risk detected for ${industry}`;
    }
    if (direction === "positive") {
      return `Moderate opportunity for ${industry}`;
    }
    return `Mixed signals for ${industry}`;
  }

  // Low severity
  return `Minor ripple effect for ${industry}`;
}

/**
 * Sort chains by relevance to a user profile.
 * Most relevant chains appear first.
 */
export function sortChainsByRelevance(
  chains: Array<{ id: string; personalImpact?: PersonalImpact }>,
): Array<{ id: string; personalImpact?: PersonalImpact }> {
  return [...chains].sort((a, b) => {
    const aScore = a.personalImpact?.relevanceScore ?? 0;
    const bScore = b.personalImpact?.relevanceScore ?? 0;
    return bScore - aScore;
  });
}
