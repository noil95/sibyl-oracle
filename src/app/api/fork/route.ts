import { NextRequest, NextResponse } from "next/server";
import { computeFork } from "@/lib/ripple/fork-engine";
import { getLatestDomainPredictions } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const overridesParam = params.get("overrides");

  if (!overridesParam) {
    return NextResponse.json({ error: "Missing overrides param" }, { status: 400 });
  }

  let overrides: Record<string, number>;
  try {
    overrides = JSON.parse(overridesParam);
  } catch {
    return NextResponse.json({ error: "Invalid overrides JSON" }, { status: 400 });
  }

  const [economic, tech] = await Promise.all([
    getLatestDomainPredictions("economic"),
    getLatestDomainPredictions("tech"),
  ]);

  const currentScores: Record<string, number> = {};
  for (const p of [...(economic ?? []), ...(tech ?? [])]) {
    const pt = (p as { predictionType?: { slug?: string } }).predictionType;
    const pred = (p as { prediction?: { win_probability?: number } }).prediction;
    if (pt?.slug) currentScores[pt.slug] = pred?.win_probability ?? 0.5;
  }

  const results = await computeFork(overrides, currentScores);
  return NextResponse.json({ forkResults: results, overrides });
}
