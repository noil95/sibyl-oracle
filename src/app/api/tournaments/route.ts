import { NextResponse } from "next/server";
import { getOpenTournaments, getTournamentPredictions } from "@/lib/db/queries";

export async function GET() {
  const tournaments = await getOpenTournaments();

  const withCounts = await Promise.all(
    tournaments.map(async (t: { id: string }) => {
      const preds = await getTournamentPredictions(t.id);
      return { ...t, participantCount: preds.length };
    })
  );

  return NextResponse.json({ tournaments: withCounts });
}
