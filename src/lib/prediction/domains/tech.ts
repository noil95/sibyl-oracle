import { fetchYahooFinance } from "@/lib/ingestion/yahoo-finance";
import { fetchCoinGeckoData } from "@/lib/ingestion/coingecko";
import { fetchNewsSentiment } from "@/lib/ingestion/newsapi";
import { fetchRedditSentiment } from "@/lib/ingestion/reddit";

export interface DomainSignal {
  source: string;
  value: number;
  weight: number;
}

interface DataSourceConfig {
  api: string;
  symbol?: string;
  coin?: string;
  query?: string;
  subreddit?: string;
}

/**
 * Fetch all signals for a tech prediction based on its data sources config.
 */
export async function fetchTechSignals(
  slug: string,
  dataSources: DataSourceConfig[],
  weights: Record<string, number>
): Promise<DomainSignal[]> {
  const signals: DomainSignal[] = [];

  for (const ds of dataSources) {
    try {
      switch (ds.api) {
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
        case "newsapi": {
          if (ds.query) {
            const result = await fetchNewsSentiment(ds.query);
            if (result.articleCount > 0) {
              signals.push({
                source: "news_sentiment",
                value: result.sentiment,
                weight: weights.news_sentiment ?? 0.3,
              });
            }
          }
          break;
        }
        case "reddit": {
          if (ds.subreddit) {
            const result = await fetchRedditSentiment(ds.subreddit);
            if (result.postCount > 0) {
              signals.push({
                source: "reddit_momentum",
                value: result.sentiment,
                weight: weights.reddit_momentum ?? 0.25,
              });
            }
          }
          break;
        }
      }
    } catch (error) {
      console.error(`Tech signal fetch error for ${slug}/${ds.api}:`, error);
    }
  }

  return signals;
}
