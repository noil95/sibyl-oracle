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

// ── Multi-Domain Prediction Engine ──

export interface DomainSignal {
  source: string;
  value: number; // normalized 0-1
  weight: number;
}

export interface DomainPredictionResult {
  score: number; // 0-1 (>0.5 = up/likely, <0.5 = down/unlikely)
  direction: "up" | "down" | "stable";
  confidence: number;
  margin: number;
}

/**
 * Compute a prediction from domain-specific signals with custom weights.
 * Used for economic and tech predictions.
 */
export function computeDomainPrediction(
  signals: DomainSignal[],
  expectedSources = 3
): DomainPredictionResult {
  if (signals.length === 0) {
    return { score: 0.5, direction: "stable", confidence: 0, margin: 0.25 };
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const signal of signals) {
    weightedSum += signal.value * signal.weight;
    totalWeight += signal.weight;
  }

  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  const score = clamp(rawScore, MIN_PROBABILITY, MAX_PROBABILITY);

  // Determine direction
  let direction: "up" | "down" | "stable" = "stable";
  if (score > 0.55) direction = "up";
  else if (score < 0.45) direction = "down";

  // Confidence based on signal coverage
  const sourceCoverage = Math.min(signals.length / expectedSources, 1);
  const confidence = clamp(sourceCoverage, 0, 1);
  const margin = (1 - confidence) * 0.25;

  return { score, direction, confidence, margin };
}
