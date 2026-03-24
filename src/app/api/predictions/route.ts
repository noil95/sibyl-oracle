import { NextResponse } from "next/server";
import { getActiveElection, getLatestPredictions, getPredictionHistory, getCandidates } from "@/lib/db/queries";

export async function GET() {
  try {
    const election = await getActiveElection();
    const candidates = await getCandidates(election.id);
    const predictions = await getLatestPredictions(election.id);

    // Get history for each candidate
    const history: Record<string, { computed_at: string; win_probability: number }[]> = {};
    for (const candidate of candidates) {
      history[candidate.id] = await getPredictionHistory(candidate.id);
    }

    return NextResponse.json({
      election,
      candidates,
      predictions,
      history,
    });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}
