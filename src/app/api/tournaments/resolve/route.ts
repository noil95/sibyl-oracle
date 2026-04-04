import { NextRequest, NextResponse } from "next/server";
import {
  getTournamentById,
  getTournamentPredictions,
  resolveTournament,
  upsertLeaderboardEntry,
} from "@/lib/db/queries";
import { brierScore, resolutionToOutcome } from "@/lib/scoring/brier";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tournamentId, resolution } = await request.json();

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await resolveTournament(tournamentId, resolution);

  const predictions = await getTournamentPredictions(tournamentId);
  const outcome = resolutionToOutcome(resolution);

  for (const pred of predictions) {
    const score = brierScore(pred.predicted_probability, outcome);
    await upsertLeaderboardEntry(pred.user_id, score);
  }

  return NextResponse.json({
    resolved: true,
    participants: predictions.length,
  });
}
