export const SIGNAL_WEIGHTS = {
  polling: 0.55,
  news_sentiment: 0.20,
  reddit_momentum: 0.15,
  fundraising: 0.10,
} as const;

// Never show 0% or 100% — epistemically dishonest
export const MIN_PROBABILITY = 0.05;
export const MAX_PROBABILITY = 0.95;
