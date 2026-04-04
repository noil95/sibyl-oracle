import { NextRequest, NextResponse } from "next/server";
import {
  getWatchedSources,
  addWatchedSource,
  removeWatchedSource,
} from "@/lib/db/queries";
import { validateUserId, watchSourceSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const userId = validateUserId(request.headers);
  if (!userId) {
    return NextResponse.json({ error: "Invalid or missing X-User-Id" }, { status: 401 });
  }

  const sources = await getWatchedSources(userId);
  return NextResponse.json({ sources });
}

export async function POST(request: NextRequest) {
  const userId = validateUserId(request.headers);
  if (!userId) {
    return NextResponse.json({ error: "Invalid or missing X-User-Id" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = watchSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { predictionSlug, sourceUrl, sourceType } = parsed.data;

  try {
    const source = await addWatchedSource(userId, predictionSlug, sourceUrl, sourceType);
    return NextResponse.json({ source }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add source";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = validateUserId(request.headers);
  if (!userId) {
    return NextResponse.json({ error: "Invalid or missing X-User-Id" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { id } = body as { id?: string };
  if (!id) {
    return NextResponse.json({ error: "Missing source id" }, { status: 400 });
  }

  await removeWatchedSource(id, userId);
  return NextResponse.json({ success: true });
}
