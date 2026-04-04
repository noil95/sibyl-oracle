import { NextRequest, NextResponse } from "next/server";
import { disaggregate } from "@/lib/lens/disaggregator";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const view = await disaggregate(slug);
  return NextResponse.json(view);
}
