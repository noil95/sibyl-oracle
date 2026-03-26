// EIA (Energy Information Administration) API Client
// Free: 1000 requests/day with API key
// Docs: https://www.eia.gov/opendata/documentation.php

const EIA_BASE = "https://api.eia.gov/v2";
const EIA_API_KEY = process.env.EIA_API_KEY || "DEMO_KEY";

interface EiaDataPoint {
  period: string;
  value: number;
}

interface EiaResponse {
  response: {
    data: EiaDataPoint[];
    total: number;
  };
}

/**
 * Fetch energy data from EIA API v2.
 * Returns a trend score (0-1) where >0.5 means prices rising.
 */
export async function fetchEiaData(
  seriesPath: string
): Promise<{ trend: number; latestValue: number; dataPoints: number }> {
  try {
    // EIA v2 uses route-based series: /petroleum/pri/spt/data/
    // For crude oil (WTI): /petroleum/pri/spt/data/?data[]=value&facets[product][]=EPCBRENT&frequency=daily
    const url = buildEiaUrl(seriesPath);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`EIA API error: ${response.status}`);
      return { trend: 0.5, latestValue: 0, dataPoints: 0 };
    }

    const data: EiaResponse = await response.json();

    if (!data.response?.data?.length) {
      return { trend: 0.5, latestValue: 0, dataPoints: 0 };
    }

    const values = data.response.data
      .filter((d) => d.value != null)
      .map((d) => d.value)
      .reverse(); // oldest first

    if (values.length < 2) {
      return { trend: 0.5, latestValue: values[0] ?? 0, dataPoints: values.length };
    }

    const trend = calculateEiaTrend(values);

    return {
      trend,
      latestValue: values[values.length - 1],
      dataPoints: values.length,
    };
  } catch (error) {
    console.error(`EIA fetch error:`, error);
    return { trend: 0.5, latestValue: 0, dataPoints: 0 };
  }
}

/**
 * Build EIA v2 API URL for crude oil spot prices.
 */
function buildEiaUrl(seriesPath: string): string {
  // Default: WTI Crude Oil daily spot price
  if (seriesPath === "PET.RWTC.D" || seriesPath === "crude-oil") {
    return `${EIA_BASE}/petroleum/pri/spt/data/?api_key=${EIA_API_KEY}&data[]=value&facets[product][]=EPCWTI&frequency=daily&sort[0][column]=period&sort[0][direction]=desc&length=30`;
  }

  // Fallback: generic series path
  return `${EIA_BASE}/${seriesPath}?api_key=${EIA_API_KEY}&data[]=value&frequency=daily&sort[0][column]=period&sort[0][direction]=desc&length=30`;
}

/**
 * Calculate trend from energy price data (oldest to newest).
 */
function calculateEiaTrend(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0.5;

  // Compare recent week avg to previous week avg
  const halfLen = Math.max(1, Math.floor(n / 2));
  const recentAvg = values.slice(-halfLen).reduce((a, b) => a + b, 0) / halfLen;
  const olderAvg = values.slice(0, halfLen).reduce((a, b) => a + b, 0) / halfLen;

  if (olderAvg === 0) return 0.5;

  const pctChange = (recentAvg - olderAvg) / Math.abs(olderAvg);
  // Oil can move +-15% in a month
  const clamped = Math.max(-0.15, Math.min(0.15, pctChange));
  return 0.5 + clamped * (0.5 / 0.15); // Maps +-0.15 → 0..1
}
