// BLS (Bureau of Labor Statistics) API Client
// Free: 500 requests/day (no key needed for v1, key for v2)
// Docs: https://www.bls.gov/developers/

const BLS_BASE = "https://api.bls.gov/publicAPI/v1/timeseries/data";

interface BlsSeriesData {
  year: string;
  period: string;
  periodName: string;
  value: string;
}

interface BlsResponse {
  status: string;
  Results: {
    series: Array<{
      seriesID: string;
      data: BlsSeriesData[];
    }>;
  };
}

/**
 * Fetch labor statistics from BLS.
 * Returns a trend score (0-1) where >0.5 means the metric is rising.
 */
export async function fetchBlsData(
  seriesId: string
): Promise<{ trend: number; latestValue: number; dataPoints: number }> {
  try {
    // BLS v1 API uses POST with JSON body
    const currentYear = new Date().getFullYear();
    const response = await fetch(BLS_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: [seriesId],
        startyear: String(currentYear - 1),
        endyear: String(currentYear),
      }),
    });

    if (!response.ok) {
      console.error(`BLS API error for ${seriesId}: ${response.status}`);
      return { trend: 0.5, latestValue: 0, dataPoints: 0 };
    }

    const data: BlsResponse = await response.json();

    if (
      data.status !== "REQUEST_SUCCEEDED" ||
      !data.Results.series.length ||
      !data.Results.series[0].data.length
    ) {
      return { trend: 0.5, latestValue: 0, dataPoints: 0 };
    }

    const seriesData = data.Results.series[0].data;
    const values = seriesData
      .filter((d) => d.period.startsWith("M")) // Monthly data only
      .map((d) => parseFloat(d.value))
      .reverse(); // oldest first

    if (values.length < 2) {
      return { trend: 0.5, latestValue: values[0] ?? 0, dataPoints: values.length };
    }

    const trend = calculateBlsTrend(values);

    return {
      trend,
      latestValue: values[values.length - 1],
      dataPoints: values.length,
    };
  } catch (error) {
    console.error(`BLS fetch error for ${seriesId}:`, error);
    return { trend: 0.5, latestValue: 0, dataPoints: 0 };
  }
}

/**
 * Calculate trend from BLS time series (oldest to newest).
 * Uses 3-month moving average comparison.
 */
function calculateBlsTrend(values: number[]): number {
  const n = values.length;
  if (n < 4) {
    // Simple 2-point comparison
    const change = (values[n - 1] - values[0]) / Math.abs(values[0] || 1);
    return 0.5 + Math.max(-0.5, Math.min(0.5, change * 5));
  }

  // Compare last 3 months avg to previous 3 months avg
  const recent3 = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const prev3 = values.slice(-6, -3).reduce((a, b) => a + b, 0) / Math.min(3, values.slice(-6, -3).length || 1);

  if (prev3 === 0) return 0.5;

  const pctChange = (recent3 - prev3) / Math.abs(prev3);
  // For unemployment: +-2% change maps to full range
  const clamped = Math.max(-0.2, Math.min(0.2, pctChange));
  return 0.5 + clamped * 2.5;
}
