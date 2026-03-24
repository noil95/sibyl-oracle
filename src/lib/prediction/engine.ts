import { SIGNAL_WEIGHTS, MIN_PROBABILITY, MAX_PROBABILITY } from "./weights";

export interface Signal {
  source: "polling" | "news_sentiment" | "reddit_momentum" | "fundraising";
  value: number; // normalized 0-1
}

export interface PredictionResult {
  winProbability: number;
  confidence: number;
  margin: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computePrediction(signals: Signal[]): PredictionResult {
  if (signals.length === 0) {
    return { winProbability: 0.5, confidence: 0, margin: 0.25 };
  }

  let weightedSum = 0;
  let totalWeight = 0;
  let signalCount = 0;

  for (const signal of signals) {
    const weight = SIGNAL_WEIGHTS[signal.source] ?? 0;
    weightedSum += signal.value * weight;
    totalWeight += weight;
    signalCount++;
  }

  const rawProbability = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  const winProbability = clamp(rawProbability, MIN_PROBABILITY, MAX_PROBABILITY);

  // Confidence based on how many signal sources we have and data volume
  const maxSources = Object.keys(SIGNAL_WEIGHTS).length;
  const sourceCoverage = signalCount / maxSources;
  const confidence = clamp(sourceCoverage, 0, 1);

  // Margin of error inversely proportional to confidence
  const margin = (1 - confidence) * 0.25;

  return { winProbability, confidence, margin };
}
