import { computeFork } from "@/lib/ripple/fork-engine";

interface FragilityResult {
  slug: string;
  originalScore: number;
  shockedScore: number;
  fragility: number;
  direction: "up" | "down" | "stable";
}

export async function runStressTest(
  overrides: Record<string, number>,
  currentScores: Record<string, number>
): Promise<FragilityResult[]> {
  const forkResults = await computeFork(overrides, currentScores);

  const fragilities: FragilityResult[] = forkResults.map((r) => ({
    slug: r.slug,
    originalScore: r.originalScore,
    shockedScore: r.forkedScore,
    fragility: Math.abs(r.delta),
    direction: r.direction,
  }));

  // Sort by fragility descending (most fragile first)
  fragilities.sort((a, b) => b.fragility - a.fragility);

  return fragilities;
}
