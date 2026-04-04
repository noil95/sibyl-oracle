import { getLatestDomainPredictions } from "@/lib/db/queries";

export async function buildAgentContext(domain: string): Promise<string> {
  const predictions = await getLatestDomainPredictions(domain);

  if (!predictions?.length) {
    return "No live prediction data available at this time.";
  }

  const lines = predictions.map(
    (p: { predictionType: { name: string }; prediction: { win_probability: number; direction: string } | null }) =>
      `- ${p.predictionType.name}: ${Math.round((p.prediction?.win_probability ?? 0.5) * 100)}% (${p.prediction?.direction ?? "stable"})`
  );

  return `Current live predictions for ${domain}:\n${lines.join("\n")}`;
}
