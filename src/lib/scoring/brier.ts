/**
 * Calculate Brier score for a single prediction.
 * Brier = (predicted - actual)^2
 * Lower is better. 0 = perfect, 1 = worst possible.
 *
 * @param predicted - probability the user predicted (0-1)
 * @param actualOutcome - 1 if event happened, 0 if not
 */
export function brierScore(predicted: number, actualOutcome: number): number {
  return (predicted - actualOutcome) ** 2;
}

/**
 * Convert a tournament resolution string to a numeric outcome.
 * 'yes'|'up' = 1, 'no'|'down' = 0, 'stable' = 0.5
 */
export function resolutionToOutcome(resolution: string): number {
  switch (resolution.toLowerCase()) {
    case "yes":
    case "up":
      return 1;
    case "no":
    case "down":
      return 0;
    case "stable":
      return 0.5;
    default:
      return 0.5;
  }
}

/**
 * Determine rank title based on prediction count.
 */
export function getRankTitle(totalPredictions: number): string {
  if (totalPredictions >= 100) return "Oracle";
  if (totalPredictions >= 50) return "Strategist";
  if (totalPredictions >= 10) return "Analyst";
  return "Novice";
}
