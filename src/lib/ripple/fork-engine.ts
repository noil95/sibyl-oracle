import { getPredictionRelationships } from "@/lib/db/queries";

interface ForkResult {
  slug: string;
  originalScore: number;
  forkedScore: number;
  delta: number;
  direction: "up" | "down" | "stable";
}

export async function computeFork(
  overrides: Record<string, number>,
  currentScores: Record<string, number>
): Promise<ForkResult[]> {
  const relationships = await getPredictionRelationships();
  const results = new Map<string, ForkResult>();

  for (const [slug, newScore] of Object.entries(overrides)) {
    const original = currentScores[slug] ?? 0.5;
    results.set(slug, {
      slug,
      originalScore: original,
      forkedScore: newScore,
      delta: newScore - original,
      direction: newScore > original + 0.05 ? "up" : newScore < original - 0.05 ? "down" : "stable",
    });
  }

  const queue: Array<{ slug: string; depth: number }> = Object.keys(overrides).map(
    (slug) => ({ slug, depth: 0 })
  );
  const visited = new Set<string>(Object.keys(overrides));

  while (queue.length > 0) {
    const { slug, depth } = queue.shift()!;
    if (depth >= 4) continue;

    const parentResult = results.get(slug);
    if (!parentResult) continue;

    const downstream = relationships.filter(
      (r: { source_slug: string }) => r.source_slug === slug
    );

    for (const rel of downstream) {
      if (visited.has(rel.target_slug)) continue;
      visited.add(rel.target_slug);

      const originalScore = currentScores[rel.target_slug] ?? 0.5;
      const cascadeDelta = parentResult.delta * rel.multiplier;
      const forkedScore = Math.max(0.05, Math.min(0.95, originalScore + cascadeDelta));

      const result: ForkResult = {
        slug: rel.target_slug,
        originalScore,
        forkedScore,
        delta: cascadeDelta,
        direction: cascadeDelta > 0.05 ? "up" : cascadeDelta < -0.05 ? "down" : "stable",
      };

      results.set(rel.target_slug, result);
      queue.push({ slug: rel.target_slug, depth: depth + 1 });
    }
  }

  return Array.from(results.values());
}
