const SUBREDDITS = ["politics", "Pennsylvania", "news"];

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    score: number;
    num_comments: number;
    created_utc: number;
  };
}

interface RedditListing {
  data: {
    children: RedditPost[];
  };
}

const POSITIVE_WORDS = new Set([
  "win", "lead", "ahead", "surge", "momentum", "popular", "support",
  "endorsed", "rally", "strong", "victory", "favored", "boost",
  "gains", "rising", "confident", "advantage", "dominates", "soars",
  "approval", "praise", "hero", "champion", "success",
]);

const NEGATIVE_WORDS = new Set([
  "lose", "trail", "behind", "scandal", "controversy", "decline",
  "drop", "weak", "opposition", "criticism", "attack", "defeat",
  "struggling", "falling", "crisis", "trouble", "unpopular", "slump",
  "corrupt", "failure", "disaster", "shame", "resign",
]);

function scoreSentiment(text: string): number {
  const words = text.toLowerCase().split(/\W+/);
  let positive = 0;
  let negative = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) positive++;
    if (NEGATIVE_WORDS.has(word)) negative++;
  }

  const total = positive + negative;
  if (total === 0) return 0.5;
  return positive / total;
}

export async function fetchRedditSentiment(
  candidateName: string
): Promise<{ sentiment: number; postCount: number; momentum: number }> {
  const nameParts = candidateName.toLowerCase().split(" ");
  let allPosts: RedditPost[] = [];

  for (const subreddit of SUBREDDITS) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(candidateName)}&sort=new&t=week&limit=25`,
        {
          headers: {
            "User-Agent": "SibylOracle/1.0",
          },
        }
      );

      if (!res.ok) continue;

      const data: RedditListing = await res.json();
      if (data?.data?.children) {
        allPosts = allPosts.concat(data.data.children);
      }
    } catch {
      continue;
    }
  }

  if (allPosts.length === 0) {
    return { sentiment: 0.5, postCount: 0, momentum: 0.5 };
  }

  // Filter posts that actually mention the candidate
  const relevantPosts = allPosts.filter((post) => {
    const text = `${post.data.title} ${post.data.selftext}`.toLowerCase();
    return nameParts.some((part) => text.includes(part));
  });

  if (relevantPosts.length === 0) {
    return { sentiment: 0.5, postCount: 0, momentum: 0.5 };
  }

  // Weighted sentiment — higher-scored posts matter more
  let weightedSentiment = 0;
  let totalWeight = 0;

  for (const post of relevantPosts) {
    const text = `${post.data.title} ${post.data.selftext}`;
    const sentiment = scoreSentiment(text);
    const weight = Math.log2(Math.max(post.data.score, 1) + 1);
    weightedSentiment += sentiment * weight;
    totalWeight += weight;
  }

  const sentiment = totalWeight > 0 ? weightedSentiment / totalWeight : 0.5;

  // Momentum: total engagement (upvotes + comments) normalized
  const totalEngagement = relevantPosts.reduce(
    (sum, p) => sum + p.data.score + p.data.num_comments,
    0
  );
  // Normalize: log scale, capped at 0-1
  const momentum = Math.min(Math.log10(totalEngagement + 1) / 4, 1);

  return {
    sentiment,
    postCount: relevantPosts.length,
    momentum,
  };
}
