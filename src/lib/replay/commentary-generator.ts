import { callGroq } from "@/lib/llm/groq";
import { insertCommentary } from "@/lib/db/queries";

interface SignalSnapshot {
  source: string;
  score: number;
  raw_data?: unknown;
}

export async function generateCommentary(
  predictionSlug: string,
  timestamp: string,
  signals: SignalSnapshot[],
  previousScore: number,
  currentScore: number
): Promise<string> {
  const direction = currentScore > previousScore ? "increased" : "decreased";
  const delta = Math.abs(Math.round((currentScore - previousScore) * 100));

  const signalSummary = signals
    .map((s) => `${s.source}: ${Math.round(s.score * 100)}%`)
    .join(", ");

  const prompt = `The prediction "${predictionSlug}" ${direction} by ${delta} percentage points. Signal data: ${signalSummary}. Write a brief 1-2 sentence explanation of what likely caused this shift. Be specific and reference the data sources.`;

  const result = await callGroq({
    feature: "replay-commentary",
    systemPrompt:
      "You are a financial data analyst providing brief, factual commentary on prediction changes. Reference specific data sources. No speculation. Max 2 sentences.",
    userMessage: prompt,
    maxTokens: 150,
  });

  if (result.text) {
    await insertCommentary(
      predictionSlug,
      timestamp,
      signals,
      result.text
    );
  }

  return result.text || result.error || "Commentary unavailable.";
}
