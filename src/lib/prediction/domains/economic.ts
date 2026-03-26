import { fetchFredData } from "@/lib/ingestion/fred";
import { fetchYahooFinance } from "@/lib/ingestion/yahoo-finance";
import { fetchCoinGeckoData } from "@/lib/ingestion/coingecko";
import { fetchBlsData } from "@/lib/ingestion/bls";
import { fetchEiaData } from "@/lib/ingestion/eia";
import { fetchNewsSentiment } from "@/lib/ingestion/newsapi";
import { fetchRedditSentiment } from "@/lib/ingestion/reddit";

export interface DomainSignal {
  source: string;
  value: number;
  weight: number;
}

interface DataSourceConfig {
  api: string;
  series?: string;
  symbol?: string;
  coin?: string;
  query?: string;
  subreddit?: string;
}

/**
 * Fetch all signals for an economic prediction based on its data sources config.
 */
export async function fetchEconomicSignals(
  slug: string,
  dataSources: DataSourceConfig[],
  weights: Record<string, number>
): Promise<DomainSignal[]> {
  const signals: DomainSignal[] = [];

  for (const ds of dataSources) {
    try {
      switch (ds.api) {
        case "fred": {
          const result = await fetchFredData(ds.series!);
          if (result.dataPoints > 0) {
            signals.push({
              source: "data_trend",
              value: result.trend,
              weight: weights.data_trend ?? 0.5,
            });
          }
          break;
        }
        case "bls": {
          const result = await fetchBlsData(ds.series!);
          if (result.dataPoints > 0) {
            signals.push({
              source: "data_trend",
              value: result.trend,
              weight: weights.data_trend ?? 0.5,
            });
          }
          break;
        }
        case "yahoo": {
          const result = await fetchYahooFinance(ds.symbol!);
          if (result.currentPrice > 0) {
            signals.push({
              source: "data_trend",
              value: result.trend,
              weight: weights.data_trend ?? 0.5,
            });
          }
          break;
        }
        case "coingecko": {
          const result = await fetchCoinGeckoData(ds.coin!);
          if (result.currentPrice > 0) {
            signals.push({
              source: "data_trend",
              value: result.trend,
              weight: weights.data_trend ?? 0.5,
            });
          }
          break;
        }
        case "eia": {
          const result = await fetchEiaData(ds.series!);
          if (result.dataPoints > 0) {
            signals.push({
              source: "data_trend",
              value: result.trend,
              weight: weights.data_trend ?? 0.5,
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error(`Economic signal fetch error for ${slug}/${ds.api}:`, error);
    }
  }

  // Add news sentiment for economic topics
  const newsQuery = getEconomicNewsQuery(slug);
  if (newsQuery) {
    try {
      const newsResult = await fetchNewsSentiment(newsQuery);
      if (newsResult.articleCount > 0) {
        signals.push({
          source: "news_sentiment",
          value: newsResult.sentiment,
          weight: weights.news_sentiment ?? 0.2,
        });
      }
    } catch (error) {
      console.error(`News sentiment error for ${slug}:`, error);
    }
  }

  // Add Reddit sentiment for economic topics
  const redditQuery = getEconomicRedditQuery(slug);
  if (redditQuery) {
    try {
      const redditResult = await fetchRedditSentiment(redditQuery);
      if (redditResult.postCount > 0) {
        signals.push({
          source: "reddit_momentum",
          value: redditResult.sentiment,
          weight: weights.reddit_momentum ?? 0.15,
        });
      }
    } catch (error) {
      console.error(`Reddit sentiment error for ${slug}:`, error);
    }
  }

  return signals;
}

function getEconomicNewsQuery(slug: string): string {
  const queries: Record<string, string> = {
    "fed-rate": "federal reserve interest rate",
    "unemployment": "US unemployment jobs",
    "sp500-direction": "S&P 500 stock market",
    "bitcoin-direction": "Bitcoin price",
    "gdp-growth": "US GDP economic growth",
    "oil-price": "crude oil price",
    "inflation-cpi": "inflation CPI consumer prices",
    "housing-market": "housing market home prices",
    "dollar-strength": "US dollar DXY currency",
    "gold-price": "gold price",
  };
  return queries[slug] ?? "";
}

function getEconomicRedditQuery(slug: string): string {
  const queries: Record<string, string> = {
    "fed-rate": "federal reserve",
    "sp500-direction": "stock market",
    "bitcoin-direction": "bitcoin",
    "oil-price": "oil prices",
    "inflation-cpi": "inflation",
    "gold-price": "gold",
  };
  return queries[slug] ?? "";
}
