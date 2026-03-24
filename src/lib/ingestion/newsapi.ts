const NEWSAPI_KEY = process.env.NEWSAPI_KEY!;
const NEWSAPI_URL = "https://newsapi.org/v2/everything";

// Simple keyword-based sentiment scoring — fast, free, no LLM needed
const POSITIVE_WORDS = new Set([
  "win", "lead", "ahead", "surge", "momentum", "popular", "support",
  "endorsed", "rally", "strong", "victory", "favored", "boost",
  "gains", "rising", "confident", "advantage", "dominates", "soars",
]);

const NEGATIVE_WORDS = new Set([
  "lose", "trail", "behind", "scandal", "controversy", "decline",
  "drop", "weak", "opposition", "criticism", "attack", "defeat",
  "struggling", "falling", "crisis", "trouble", "unpopular", "slump",
]);

interface NewsArticle {
  title: string;
  description: string | null;
  publishedAt: string;
  source: { name: string };
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

function scoreSentiment(text: string): number {
  const words = text.toLowerCase().split(/\W+/);
  let positive = 0;
  let negative = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) positive++;
    if (NEGATIVE_WORDS.has(word)) negative++;
  }

  const total = positive + negative;
  if (total === 0) return 0.5; // neutral

  // Returns 0-1 where 0.5 is neutral, >0.5 is positive, <0.5 is negative
  return positive / total;
}

export async function fetchNewsSentiment(
  candidateName: string
): Promise<{ sentiment: number; articleCount: number }> {
  const params = new URLSearchParams({
    q: candidateName,
    language: "en",
    sortBy: "publishedAt",
    pageSize: "50",
    apiKey: NEWSAPI_KEY,
  });

  const response = await fetch(`${NEWSAPI_URL}?${params}`);

  if (!response.ok) {
    console.error(`NewsAPI error: ${response.status} ${response.statusText}`);
    return { sentiment: 0.5, articleCount: 0 };
  }

  const data: NewsApiResponse = await response.json();

  if (!data.articles || data.articles.length === 0) {
    return { sentiment: 0.5, articleCount: 0 };
  }

  const sentiments = data.articles.map((article) => {
    const text = `${article.title} ${article.description || ""}`;
    return scoreSentiment(text);
  });

  const avgSentiment =
    sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;

  return { sentiment: avgSentiment, articleCount: data.articles.length };
}
