import { NextRequest, NextResponse } from "next/server";
import { fetchTechSignals } from "@/lib/prediction/domains/tech";
import { computeDomainPrediction } from "@/lib/prediction/engine";
import {
  getPredictionTypes,
  insertDomainSignal,
  getRecentDomainSignals,
  insertDomainPrediction,
} from "@/lib/db/queries";

const TIER_HOURS: Record<string, number> = {
  hot: 2,
  warm: 6,
  cold: 12,
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const predictionTypes = await getPredictionTypes("tech");
    const results = [];

    for (const pt of predictionTypes) {
      try {
        // Check if we should refresh based on tier
        const shouldRefresh = await shouldRefreshPrediction(pt.id, pt.refresh_tier);
        if (!shouldRefresh) {
          results.push({ slug: pt.slug, skipped: true, reason: `${pt.refresh_tier} tier not due` });
          continue;
        }

        const weights = (pt.weights as Record<string, number>) || {};
        const dataSources = (pt.data_sources as Array<{ api: string; symbol?: string; coin?: string; query?: string; subreddit?: string }>) || [];

        // Fetch signals from all configured data sources
        const signals = await fetchTechSignals(pt.slug, dataSources, weights);

        // Store raw signals
        for (const signal of signals) {
          await insertDomainSignal({
            prediction_type_id: pt.id,
            source: signal.source,
            raw_value: signal.value,
            weight: signal.weight,
          });
        }

        // Get all recent signals and aggregate by source
        const hoursBack = (TIER_HOURS[pt.refresh_tier] || 6) * 4;
        const recentSignals = await getRecentDomainSignals(pt.id, hoursBack);

        const bySource = new Map<string, { values: number[]; weight: number }>();
        for (const s of recentSignals) {
          const existing = bySource.get(s.source) || { values: [] as number[], weight: s.weight };
          existing.values.push(s.raw_value);
          bySource.set(s.source, existing);
        }

        const aggregatedSignals = Array.from(bySource.entries()).map(
          ([source, { values, weight }]) => ({
            source,
            value: values.reduce((a, b) => a + b, 0) / values.length,
            weight,
          })
        );

        // Compute prediction
        const prediction = computeDomainPrediction(aggregatedSignals);

        await insertDomainPrediction({
          prediction_type_id: pt.id,
          win_probability: prediction.score,
          confidence: prediction.confidence,
          score: prediction.score,
          direction: prediction.direction,
        });

        results.push({
          slug: pt.slug,
          score: prediction.score,
          direction: prediction.direction,
          confidence: prediction.confidence,
          signalCount: signals.length,
        });
      } catch (error) {
        console.error(`Error processing ${pt.slug}:`, error);
        results.push({ slug: pt.slug, error: String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      domain: "tech",
      predictions: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Tech cron error:", error);
    return NextResponse.json(
      { error: "Failed to refresh tech predictions" },
      { status: 500 }
    );
  }
}

async function shouldRefreshPrediction(
  predictionTypeId: string,
  tier: string
): Promise<boolean> {
  const hoursBack = TIER_HOURS[tier] || 6;
  const recentSignals = await getRecentDomainSignals(predictionTypeId, hoursBack);
  return recentSignals.length === 0;
}
