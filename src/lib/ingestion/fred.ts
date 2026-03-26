// FRED (Federal Reserve Economic Data) API Client
// Free: 120 requests/minute, no key required for basic access
// Docs: https://fred.stlouisfed.org/docs/api/fred/

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";
const FRED_API_KEY = process.env.FRED_API_KEY || "DEMO_KEY";

interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations: FredObservation[];
}

/**
 * Fetch recent observations from a FRED data series.
 * Returns a trend score (0-1) where >0.5 means rising, <0.5 means falling.
 */
export async function fetchFredData(
  seriesId: string
): Promise<{ trend: number; latestValue: number; dataPoints: number }> {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: FRED_API_KEY,
    file_type: "json",
    sort_order: "desc",
    limit: "30",
    observation_start: getDateMonthsAgo(6),
  });

  try {
    const response = await fetch(`${FRED_BASE}?${params}`);

    if (!response.ok) {
      console.error(`FRED API error for ${seriesId}: ${response.status}`);
      return { trend: 0.5, latestValue: 0, dataPoints: 0 };
    }

    const data: FredResponse = await response.json();
    const observations = data.observations
      .filter((o) => o.value !== ".")
      .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

    if (observations.length < 2) {
      return { trend: 0.5, latestValue: observations[0]?.value ?? 0, dataPoints: observations.length };
    }

    const trend = calculateTrend(observations.map((o) => o.value));

    return {
      trend,
      latestValue: observations[0].value,
      dataPoints: observations.length,
    };
  } catch (error) {
    console.error(`FRED fetch error for ${seriesId}:`, error);
    return { trend: 0.5, latestValue: 0, dataPoints: 0 };
  }
}

/**
 * Calculate a 0-1 trend score from a series of values (newest first).
 * >0.5 = rising, <0.5 = falling, 0.5 = flat
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0.5;

  // Compare recent average (first 1/3) to older average (last 1/3)
  const third = Math.max(1, Math.floor(values.length / 3));
  const recentAvg = values.slice(0, third).reduce((a, b) => a + b, 0) / third;
  const olderAvg = values.slice(-third).reduce((a, b) => a + b, 0) / third;

  if (olderAvg === 0) return 0.5;

  // Percent change, clamped to [-20%, +20%] range, then normalized to 0-1
  const pctChange = (recentAvg - olderAvg) / Math.abs(olderAvg);
  const clamped = Math.max(-0.2, Math.min(0.2, pctChange));
  return 0.5 + clamped * 2.5; // Maps -0.2..+0.2 → 0..1
}

function getDateMonthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().split("T")[0];
}
