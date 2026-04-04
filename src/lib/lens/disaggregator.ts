import { getSignalsBySource, getPredictionTypeBySlug } from "@/lib/db/queries";

interface SourceSignal {
  source: string;
  latestValue: number;
  weight: number;
  fetchedAt: string;
}

interface DisaggregatedView {
  predictionSlug: string;
  sources: SourceSignal[];
  consensusGap: number;
}

export async function disaggregate(slug: string): Promise<DisaggregatedView> {
  const predType = await getPredictionTypeBySlug(slug);
  if (!predType) {
    return { predictionSlug: slug, sources: [], consensusGap: 0 };
  }

  const signals = await getSignalsBySource(predType.id);
  if (!signals?.length) {
    return { predictionSlug: slug, sources: [], consensusGap: 0 };
  }

  // Group by source, take latest per source
  const bySource = new Map<string, SourceSignal>();
  for (const sig of signals) {
    if (!bySource.has(sig.source)) {
      bySource.set(sig.source, {
        source: sig.source,
        latestValue: sig.raw_value,
        weight: sig.weight,
        fetchedAt: sig.fetched_at,
      });
    }
  }

  const sources = Array.from(bySource.values());
  const values = sources.map((s) => s.latestValue);
  const consensusGap = values.length > 1
    ? Math.max(...values) - Math.min(...values)
    : 0;

  return { predictionSlug: slug, sources, consensusGap };
}
