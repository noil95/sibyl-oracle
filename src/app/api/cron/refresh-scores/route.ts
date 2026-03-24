import { NextRequest, NextResponse } from "next/server";
import { fetchNewsSentiment } from "@/lib/ingestion/newsapi";
import { fetchRedditSentiment } from "@/lib/ingestion/reddit";
import { fetchPollingData } from "@/lib/ingestion/polling";
import { computePrediction, Signal } from "@/lib/prediction/engine";
import {
  getActiveElection,
  getCandidates,
  insertSignal,
  getRecentSignals,
  insertPrediction,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const election = await getActiveElection();
    const candidates = await getCandidates(election.id);

    const results = [];

    for (const candidate of candidates) {
      // Fetch all signal sources in parallel
      const [newsResult, redditResult, pollingResult] = await Promise.all([
        fetchNewsSentiment(candidate.name),
        fetchRedditSentiment(candidate.name),
        fetchPollingData(candidate.name),
      ]);

      // Store raw signals
      const signalInserts = [];

      if (newsResult.articleCount > 0) {
        signalInserts.push(
          insertSignal({
            candidate_id: candidate.id,
            source: "news_sentiment",
            raw_value: newsResult.sentiment,
            weight: 1.0,
          })
        );
      }

      if (redditResult.postCount > 0) {
        signalInserts.push(
          insertSignal({
            candidate_id: candidate.id,
            source: "reddit_momentum",
            raw_value: redditResult.sentiment,
            weight: 1.0,
          })
        );
      }

      signalInserts.push(
        insertSignal({
          candidate_id: candidate.id,
          source: "polling",
          raw_value: pollingResult.pollAverage,
          weight: 1.0,
        })
      );

      await Promise.all(signalInserts);

      // Get all recent signals and aggregate
      const recentSignals = await getRecentSignals(candidate.id);

      const bySource = new Map<string, number[]>();
      for (const s of recentSignals) {
        const vals = bySource.get(s.source) || [];
        vals.push(s.raw_value);
        bySource.set(s.source, vals);
      }

      const signals: Signal[] = [];
      for (const [source, values] of bySource) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        signals.push({
          source: source as Signal["source"],
          value: avg,
        });
      }

      const prediction = computePrediction(signals);

      await insertPrediction({
        candidate_id: candidate.id,
        win_probability: prediction.winProbability,
        confidence: prediction.confidence,
      });

      results.push({
        candidate: candidate.name,
        winProbability: prediction.winProbability,
        confidence: prediction.confidence,
        signalSources: signals.length,
        details: {
          news: { sentiment: newsResult.sentiment, articles: newsResult.articleCount },
          reddit: { sentiment: redditResult.sentiment, posts: redditResult.postCount, momentum: redditResult.momentum },
          polling: { average: pollingResult.pollAverage, source: pollingResult.source },
        },
      });
    }

    return NextResponse.json({
      success: true,
      election: election.name,
      predictions: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron refresh-scores error:", error);
    return NextResponse.json(
      { error: "Failed to refresh scores" },
      { status: 500 }
    );
  }
}
