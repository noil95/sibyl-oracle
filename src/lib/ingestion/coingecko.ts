// CoinGecko API Client (free tier, no key needed)
// Free: 30 requests/minute
// Docs: https://docs.coingecko.com/reference/introduction

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

interface CoinMarketData {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  market_cap: number;
  total_volume: number;
}

interface CoinChartData {
  prices: [number, number][]; // [timestamp, price]
}

/**
 * Fetch cryptocurrency market data from CoinGecko.
 * Returns a trend score (0-1) and current price info.
 */
export async function fetchCoinGeckoData(
  coinId: string
): Promise<{
  trend: number;
  currentPrice: number;
  change24h: number;
  change7d: number;
  change30d: number;
}> {
  try {
    // Fetch market chart for 30-day price history
    const chartResponse = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=30`
    );

    if (!chartResponse.ok) {
      console.error(`CoinGecko chart error for ${coinId}: ${chartResponse.status}`);
      return { trend: 0.5, currentPrice: 0, change24h: 0, change7d: 0, change30d: 0 };
    }

    const chartData: CoinChartData = await chartResponse.json();

    // Also fetch current market data
    const marketResponse = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${coinId}&price_change_percentage=7d,30d`
    );

    let currentPrice = 0;
    let change24h = 0;
    let change7d = 0;
    let change30d = 0;

    if (marketResponse.ok) {
      const marketData: CoinMarketData[] = await marketResponse.json();
      if (marketData.length > 0) {
        currentPrice = marketData[0].current_price;
        change24h = marketData[0].price_change_percentage_24h || 0;
        change7d = marketData[0].price_change_percentage_7d_in_currency || 0;
        change30d = marketData[0].price_change_percentage_30d_in_currency || 0;
      }
    }

    // Calculate trend from price chart
    const prices = chartData.prices.map(([, price]) => price);
    const trend = calculateCryptoTrend(prices, change24h, change7d);

    return { trend, currentPrice, change24h, change7d, change30d };
  } catch (error) {
    console.error(`CoinGecko fetch error for ${coinId}:`, error);
    return { trend: 0.5, currentPrice: 0, change24h: 0, change7d: 0, change30d: 0 };
  }
}

/**
 * Calculate crypto trend combining price movement and momentum.
 * Crypto is more volatile so we use wider bounds.
 */
function calculateCryptoTrend(
  prices: number[],
  change24h: number,
  change7d: number
): number {
  if (prices.length < 2) return 0.5;

  // Weight: 40% recent price slope, 30% 7d change, 30% 24h momentum
  const n = prices.length;
  const recentThird = Math.max(1, Math.floor(n / 3));
  const recentAvg = prices.slice(-recentThird).reduce((a, b) => a + b, 0) / recentThird;
  const olderAvg = prices.slice(0, recentThird).reduce((a, b) => a + b, 0) / recentThird;

  // Price slope normalized
  let slopeScore = 0.5;
  if (olderAvg > 0) {
    const pctChange = (recentAvg - olderAvg) / olderAvg;
    slopeScore = 0.5 + Math.max(-0.5, Math.min(0.5, pctChange));
  }

  // 7d change normalized (crypto can move +-30% in a week)
  const weekScore = 0.5 + Math.max(-0.5, Math.min(0.5, change7d / 60));

  // 24h momentum
  const dayScore = 0.5 + Math.max(-0.5, Math.min(0.5, change24h / 20));

  return slopeScore * 0.4 + weekScore * 0.3 + dayScore * 0.3;
}
