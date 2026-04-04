import { NextRequest, NextResponse } from "next/server";
import { validateUserId, chatSchema } from "@/lib/validation";
import personas from "@/lib/agents/personas.json";
import { buildAgentContext } from "@/lib/agents/context-builder";
import { callGroq } from "@/lib/llm/groq";

const userLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_HOUR = 20;

function checkUserRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = userLimits.get(userId);

  if (!entry || now > entry.resetAt) {
    userLimits.set(userId, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= MAX_PER_HOUR) {
    return false;
  }

  userLimits.set(userId, { ...entry, count: entry.count + 1 });
  return true;
}

export async function POST(request: NextRequest) {
  const userId = validateUserId(request.headers);
  if (!userId) {
    return NextResponse.json({ error: "Invalid or missing user ID" }, { status: 401 });
  }

  if (!checkUserRateLimit(userId)) {
    return NextResponse.json(
      { error: "You've reached the 20 messages per hour limit. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request: " + parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { agentId, message } = parsed.data;

  const persona = personas.find((p) => p.id === agentId);
  if (!persona) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const context = await buildAgentContext(persona.domain);
  const systemPrompt = persona.systemPrompt + "\n\nLive data:\n" + context;

  const result = await callGroq({
    feature: "agent-chat",
    systemPrompt,
    userMessage: message,
    maxTokens: 300,
  });

  if (result.error) {
    return NextResponse.json({ response: "", error: result.error }, { status: 503 });
  }

  return NextResponse.json({ response: result.text });
}
