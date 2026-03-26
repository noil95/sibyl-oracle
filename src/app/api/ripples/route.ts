import { NextRequest, NextResponse } from "next/server";
import {
  getAllChains,
  getChainById,
  calculateRippleChain,
  getChainSummary,
  type LivePrediction,
} from "@/lib/ripple/engine";
import { computePersonalImpact, type UserProfile } from "@/lib/ripple/personal-impact";
import { getLatestDomainPredictions } from "@/lib/db/queries";

/**
 * GET /api/ripples
 *   → Returns all chain summaries with trigger scores
 *
 * GET /api/ripples?chain=fed-rate-to-housing
 *   → Returns full calculated chain with all nodes + ripple deltas
 *
 * GET /api/ripples?chain=fed-rate-to-housing&profile=<base64>
 *   → Returns chain + personal impact node
 */
export async function GET(request: NextRequest) {
  try {
    // Load live predictions from all domains
    const livePredictions = await loadLivePredictions();

    const chainId = request.nextUrl.searchParams.get("chain");
    const profileParam = request.nextUrl.searchParams.get("profile");

    // If no chain specified, return all summaries
    if (!chainId) {
      const chains = getAllChains();
      const summaries = chains.map((chain) =>
        getChainSummary(chain, livePredictions)
      );

      // Sort by volatility (most active first)
      summaries.sort((a, b) => {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.volatility] - order[a.volatility];
      });

      return NextResponse.json({ chains: summaries });
    }

    // Specific chain requested
    const chain = getChainById(chainId);
    if (!chain) {
      return NextResponse.json(
        { error: `Chain "${chainId}" not found` },
        { status: 404 }
      );
    }

    // Calculate ripple chain
    const nodes = calculateRippleChain(chain, livePredictions);

    // Calculate personal impact if profile provided
    let personalImpact = null;
    if (profileParam) {
      try {
        const decoded = Buffer.from(profileParam, "base64").toString("utf-8");
        const userProfile: UserProfile = JSON.parse(decoded);
        const finalDelta = nodes[nodes.length - 1]?.rippleDelta ?? 0;
        personalImpact = computePersonalImpact(chain, finalDelta, userProfile);
      } catch {
        // Invalid profile, compute without personalization
        const finalDelta = nodes[nodes.length - 1]?.rippleDelta ?? 0;
        personalImpact = computePersonalImpact(chain, finalDelta);
      }
    } else {
      // No profile, compute generic impact
      const finalDelta = nodes[nodes.length - 1]?.rippleDelta ?? 0;
      personalImpact = computePersonalImpact(chain, finalDelta);
    }

    return NextResponse.json({
      chain: {
        id: chain.id,
        name: chain.name,
        emoji: chain.emoji,
        description: chain.description,
      },
      nodes,
      personalImpact,
    });
  } catch (error) {
    console.error("Ripples API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate ripple chain" },
      { status: 500 }
    );
  }
}

/**
 * Load all live predictions into a Map keyed by slug.
 */
async function loadLivePredictions(): Promise<Map<string, LivePrediction>> {
  const map = new Map<string, LivePrediction>();

  try {
    const [econPredictions, techPredictions] = await Promise.all([
      getLatestDomainPredictions("economic"),
      getLatestDomainPredictions("tech"),
    ]);

    for (const item of [...econPredictions, ...techPredictions]) {
      const pt = item.predictionType;
      const pred = item.prediction;

      map.set(pt.slug, {
        score: pred?.score ?? pred?.win_probability ?? 0.5,
        direction: pred?.direction ?? "stable",
        name: pt.name,
        domain: pt.domain,
        description: pt.description ?? "",
      });
    }
  } catch (error) {
    console.error("Error loading live predictions for ripples:", error);
  }

  return map;
}
