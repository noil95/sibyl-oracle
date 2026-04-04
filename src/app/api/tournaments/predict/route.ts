import { NextRequest, NextResponse } from "next/server";
import { predictSchema, validateUserId } from "@/lib/validation";
import { getTournamentById, submitPrediction } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const userId = validateUserId(request.headers);
  if (!userId) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = predictSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { tournamentId, probability } = parsed.data;

  const tournament = await getTournamentById(tournamentId);
  if (!tournament || tournament.status !== "open") {
    return NextResponse.json({ error: "Tournament not open" }, { status: 400 });
  }

  if (new Date(tournament.closes_at) < new Date()) {
    return NextResponse.json({ error: "Tournament closed" }, { status: 400 });
  }

  const prediction = await submitPrediction(tournamentId, userId, probability);
  return NextResponse.json({ prediction });
}
