import { ImageResponse } from "@vercel/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: election } = await supabase
      .from("elections")
      .select("*")
      .eq("status", "active")
      .single();

    const { data: candidates } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", election.id);

    const { data: predictions } = await supabase
      .from("predictions")
      .select("*")
      .in("candidate_id", candidates!.map((c: { id: string }) => c.id))
      .order("computed_at", { ascending: false });

    // Get latest prediction per candidate
    const predMap = new Map<string, number>();
    for (const p of predictions ?? []) {
      if (!predMap.has(p.candidate_id)) {
        predMap.set(p.candidate_id, p.win_probability);
      }
    }

    const candidateData = (candidates ?? []).map((c: { id: string; name: string; party: string }) => ({
      name: c.name,
      party: c.party,
      pct: Math.round((predMap.get(c.id) ?? 0.5) * 100),
    }));

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #0a0a1a 0%, #1a1030 50%, #0a0a1a 100%)",
            padding: "60px",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: 900,
              }}
            >
              S
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "white", fontSize: "28px", fontWeight: 700 }}>
                Sibyl Oracle
              </span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", letterSpacing: "3px" }}>
                AI-POWERED PREDICTIONS
              </span>
            </div>
          </div>

          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "20px", marginBottom: "40px" }}>
            {election.name}
          </div>

          <div style={{ display: "flex", gap: "40px", flex: 1 }}>
            {candidateData.map((c: { name: string; party: string; pct: number }) => {
              const color = c.party === "Democrat" ? "#3b82f6" : "#ef4444";
              return (
                <div
                  key={c.name}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "16px",
                    borderRadius: "24px",
                    border: `2px solid ${color}33`,
                    background: `${color}08`,
                    padding: "40px",
                  }}
                >
                  <span style={{ color: "white", fontSize: "96px", fontWeight: 900, lineHeight: 1 }}>
                    {c.pct}%
                  </span>
                  <span style={{ color: "white", fontSize: "28px", fontWeight: 600 }}>
                    {c.name}
                  </span>
                  <span
                    style={{
                      color,
                      fontSize: "14px",
                      fontWeight: 600,
                      letterSpacing: "2px",
                      background: `${color}15`,
                      padding: "4px 16px",
                      borderRadius: "100px",
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {c.party.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "30px",
              color: "rgba(255,255,255,0.2)",
              fontSize: "14px",
            }}
          >
            <span>Live prediction — updated every 15 minutes</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
              <span>Live</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0a0a1a 0%, #1a1030 50%, #0a0a1a 100%)",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <span style={{ color: "white", fontSize: "64px", fontWeight: 900 }}>Sibyl Oracle</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "24px" }}>AI-Powered Political Predictions</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
