import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { checkForChanges } from "@/lib/sources/change-detector";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sources, error } = await supabaseAdmin
    .from("watched_sources")
    .select("*");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 });
  }

  const results = [];

  for (const source of sources ?? []) {
    const { changed, newHash, error: fetchError } = await checkForChanges(
      source.source_url,
      source.last_hash ?? null
    );

    if (fetchError) {
      const newFailCount = (source.fail_count ?? 0) + 1;

      if (newFailCount >= 5) {
        await supabaseAdmin
          .from("watched_sources")
          .delete()
          .eq("id", source.id);

        results.push({ id: source.id, url: source.source_url, action: "disabled", reason: fetchError });
      } else {
        await supabaseAdmin
          .from("watched_sources")
          .update({
            fail_count: newFailCount,
            last_checked: new Date().toISOString(),
          })
          .eq("id", source.id);

        results.push({ id: source.id, url: source.source_url, action: "failed", failCount: newFailCount });
      }
    } else {
      await supabaseAdmin
        .from("watched_sources")
        .update({
          last_hash: newHash,
          last_checked: new Date().toISOString(),
          fail_count: 0,
        })
        .eq("id", source.id);

      results.push({ id: source.id, url: source.source_url, action: changed ? "changed" : "unchanged" });
    }
  }

  return NextResponse.json({ success: true, processed: results.length, results });
}
