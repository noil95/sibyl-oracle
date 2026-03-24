import { NextRequest, NextResponse } from "next/server";
import { getImpactStatement, type Sector } from "@/lib/impact/templates";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidate = searchParams.get("candidate");
  const sector = searchParams.get("sector") as Sector;
  const probability = parseFloat(searchParams.get("probability") ?? "0.5");

  if (!candidate || !sector) {
    return NextResponse.json(null, { status: 400 });
  }

  const impact = getImpactStatement(candidate, sector, probability);
  return NextResponse.json(impact);
}
