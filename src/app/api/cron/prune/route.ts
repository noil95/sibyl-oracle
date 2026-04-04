import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const cutoff90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const cutoff14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [predResult, commentaryResult, signalsResult] = await Promise.all([
    supabaseAdmin
      .from("user_predictions")
      .delete()
      .lt("predicted_at", cutoff90)
      .select("id"),
    supabaseAdmin
      .from("replay_commentary")
      .delete()
      .lt("created_at", cutoff30)
      .select("id"),
    supabaseAdmin
      .from("signals")
      .delete()
      .lt("fetched_at", cutoff14)
      .select("id"),
  ]);

  return NextResponse.json({
    success: true,
    pruned: {
      user_predictions: predResult.data?.length ?? 0,
      replay_commentary: commentaryResult.data?.length ?? 0,
      signals: signalsResult.data?.length ?? 0,
    },
    timestamp: now.toISOString(),
  });
}
