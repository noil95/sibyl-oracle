// Polling data ingestion
// In Phase 1, we use a baseline from known polling averages
// and supplement with scraped RealClearPolitics data when available.

interface PollingResult {
  candidateName: string;
  pollAverage: number; // 0-1 normalized
  sampleSize: number;
  source: string;
}

// Baseline polling data — updated manually or via scraping
// These represent recent polling averages for the tracked race
const BASELINE_POLLS: Record<string, number> = {
  "John Fetterman": 0.52,
  "Dave McCormick": 0.48,
};

export async function fetchPollingData(
  candidateName: string
): Promise<PollingResult> {
  // Try to fetch fresh polling data from RCP RSS
  try {
    const freshData = await scrapePollingData(candidateName);
    if (freshData) return freshData;
  } catch {
    // Fall through to baseline
  }

  // Fall back to baseline polling averages
  const baseline = BASELINE_POLLS[candidateName] ?? 0.5;

  return {
    candidateName,
    pollAverage: baseline,
    sampleSize: 1000,
    source: "baseline",
  };
}

async function scrapePollingData(
  candidateName: string
): Promise<PollingResult | null> {
  // Attempt to get polling data from RealClearPolitics RSS
  try {
    const res = await fetch(
      "https://www.realclearpolitics.com/epolls/latest_polls/senate/",
      {
        headers: {
          "User-Agent": "SibylOracle/1.0",
        },
      }
    );

    if (!res.ok) return null;

    const html = await res.text();

    // Simple pattern matching for polling numbers
    const namePattern = candidateName.split(" ").pop()!; // Last name
    const regex = new RegExp(
      `${namePattern}[^\\d]*(\\d+\\.?\\d*)%?`,
      "i"
    );
    const match = html.match(regex);

    if (match && match[1]) {
      const percentage = parseFloat(match[1]);
      if (percentage > 0 && percentage <= 100) {
        return {
          candidateName,
          pollAverage: percentage / 100,
          sampleSize: 1000,
          source: "realclearpolitics",
        };
      }
    }
  } catch {
    // Scraping failed, return null
  }

  return null;
}
