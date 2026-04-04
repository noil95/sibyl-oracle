import { NextRequest, NextResponse } from "next/server";
import {
  getDomainPredictionHistory,
  getPredictionTypeBySlug,
  getCachedCommentary,
} from "@/lib/db/queries";

interface InflectionPoint {
  timestamp: string;
  delta: number;
  commentary: string | null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const predType = await getPredictionTypeBySlug(slug);
  if (!predType) {
    return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  }

  const [history, cachedCommentary] = await Promise.all([
    getDomainPredictionHistory(predType.id),
    getCachedCommentary(slug),
  ]);

  // Build commentary lookup by timestamp
  const commentaryMap = new Map<string, string>();
  for (const c of cachedCommentary ?? []) {
    commentaryMap.set(c.timestamp, c.commentary);
  }

  // Identify inflection points: >5% shift between consecutive entries
  const inflections: InflectionPoint[] = [];
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    const prevScore = prev.score ?? prev.win_probability ?? 0;
    const currScore = curr.score ?? curr.win_probability ?? 0;
    const delta = currScore - prevScore;

    if (Math.abs(delta) > 0.05) {
      inflections.push({
        timestamp: curr.computed_at,
        delta,
        commentary: commentaryMap.get(curr.computed_at) ?? null,
      });
    }
  }

  return NextResponse.json({ history, inflections });
}
