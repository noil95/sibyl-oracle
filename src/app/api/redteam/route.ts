import { NextRequest, NextResponse } from "next/server";
import scenariosRaw from "@/lib/redteam/scenarios.json";
import { runStressTest } from "@/lib/redteam/stress-test";
import { getLatestDomainPredictions } from "@/lib/db/queries";

interface Scenario {
  id: string;
  name: string;
  overrides: Record<string, number>;
}

const scenarios: Scenario[] = scenariosRaw as unknown as Scenario[];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const scenarioParam = searchParams.get("scenario");
  const overridesParam = searchParams.get("overrides");

  let overrides: Record<string, number> = {};

  if (scenarioParam) {
    const found = scenarios.find((s) => s.id === scenarioParam);
    if (!found) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }
    overrides = found.overrides;
  } else if (overridesParam) {
    try {
      overrides = JSON.parse(overridesParam);
    } catch {
      return NextResponse.json({ error: "Invalid overrides JSON" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Provide scenario or overrides param" }, { status: 400 });
  }

  const [economic, tech] = await Promise.all([
    getLatestDomainPredictions("economic"),
    getLatestDomainPredictions("tech"),
  ]);

  const currentScores: Record<string, number> = {};
  for (const p of [...(economic ?? []), ...(tech ?? [])]) {
    const pt = (p as { predictionType?: { slug?: string } }).predictionType;
    const pred = (p as { prediction?: { win_probability?: number } }).prediction;
    if (pt?.slug) {
      currentScores[pt.slug] = pred?.win_probability ?? 0.5;
    }
  }

  const results = await runStressTest(overrides, currentScores);
  const scenarioName = scenarioParam
    ? (scenarios.find((s) => s.id === scenarioParam)?.name ?? scenarioParam)
    : "Custom";

  return NextResponse.json({ results, scenarioName, overrides });
}
