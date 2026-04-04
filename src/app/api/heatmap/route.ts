import { NextResponse } from "next/server";
import {
  getLatestDomainPredictions,
  getPredictionRelationships,
} from "@/lib/db/queries";

export async function GET() {
  const [economic, tech, relationships] = await Promise.all([
    getLatestDomainPredictions("economic"),
    getLatestDomainPredictions("tech"),
    getPredictionRelationships(),
  ]);

  const predictions = [...(economic ?? []), ...(tech ?? [])];

  const nodes = predictions.map((p: { predictionType: { slug: string; name: string; domain: string }; prediction: { win_probability?: number; confidence?: number } | null }) => ({
    id: p.predictionType.slug,
    label: p.predictionType.name,
    domain: p.predictionType.domain,
    score: p.prediction?.win_probability ?? 0.5,
    confidence: p.prediction?.confidence ?? 0.5,
  }));

  const edges = relationships.map((r: { source_slug: string; target_slug: string; multiplier: number }) => ({
    source: r.source_slug,
    target: r.target_slug,
    multiplier: r.multiplier,
  }));

  return NextResponse.json({ nodes, edges });
}
