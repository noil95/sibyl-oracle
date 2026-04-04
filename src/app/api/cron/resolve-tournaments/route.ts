import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find tournaments past closes_at that are still 'open'
  const { data: tournaments } = await supabaseAdmin
    .from("tournaments")
    .select("*")
    .eq("status", "open")
    .lt("closes_at", new Date().toISOString());

  if (!tournaments?.length) {
    return NextResponse.json({ closed: 0 });
  }

  let closedCount = 0;

  for (const t of tournaments) {
    await supabaseAdmin
      .from("tournaments")
      .update({ status: "closed" })
      .eq("id", t.id);
    closedCount++;
  }

  return NextResponse.json({ closed: closedCount });
}
