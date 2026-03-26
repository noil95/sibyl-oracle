// Yahoo Finance API Client (unofficial, no key needed)
// Uses the v8 chart endpoint for historical price data

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

interface YahooChartResult {
  meta: { regularMarketPrice: number; previousClose: number };
  timestamp: number[];
  indicators: {
    quote: Array<{ close: (number | null)[] }>;
  };
}

interface YahooResponse {
  chart: {
    result: YahooChartResult[] | null;
    error: { code: string; description: string } | null;
  };
}

/**
 * Fetch stock/index price data from Yahoo Finance.
 * Returns a trend score (0-1) and current price.
 */
export async function fetchYahooFinance(
  symbol: string
): Promise<{ trend: number; currentPrice: number; changePercent: number }> {
  const params = new URLSearchParams({
    interval: "1d",
    range: "1mo",
  });

  try {
    const response = await fetch(`${YAHOO_BASE}/${encodeURIComponent(symbol)}?${params}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SibylOracle/1.0)",
      },
    });

    if (!response.ok) {
      console.error(`Yahoo Finance error for ${symbol}: ${response.status}`);
      return { trend: 0.5, currentPrice: 0, changePercent: 0 };
    }

    const data: YahooResponse = await response.json();

    if (!data.chart.result || data.chart.result.length === 0) {
      return { trend: 0.5, currentPrice: 0, changePercent: 0 };
    }

    const result = data.chart.result[0];
    const currentPrice = result.meta.regularMarketPrice;
    const previousClose = result.meta.previousClose;
    const closes = result.indicators.quote[0].close.filter(
      (c): c is number => c !== null
    );

    if (closes.length < 2) {
      return { trend: 0.5, currentPrice, changePercent: 0 };
    }

    // Calculate trend from price movement over the period
    const trend = calculatePriceTrend(closes);
    const changePercent = previousClose > 0
      ? ((currentPrice - previousClose) / previousClose) * 100
      : 0;

    return { trend, currentPrice, changePercent };
  } catch (error) {
    console.error(`Yahoo Finance fetch error for ${symbol}:`, error);
    return { trend: 0.5, currentPrice: 0, changePercent: 0 };
  }
}

/**
 * Calculate trend from closing prices (oldest to newest).
 * Uses simple linear regression slope normalized to 0-1.
 */
function calculatePriceTrend(closes: number[]): number {
  const n = closes.length;
  if (n < 2) return 0.5;

  // Simple linear regression
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += closes[i];
    sumXY += i * closes[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgPrice = sumY / n;

  if (avgPrice === 0) return 0.5;

  // Normalize slope as percentage of average price per day
  const dailyPctChange = (slope / avgPrice);
  // Clamp to [-2%, +2%] daily change, map to 0-1
  const clamped = Math.max(-0.02, Math.min(0.02, dailyPctChange));
  return 0.5 + clamped * 25; // Maps -0.02..+0.02 → 0..1
}
