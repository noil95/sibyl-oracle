import Groq from "groq-sdk";
import { checkRateLimit } from "./rate-limiter";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface GroqOptions {
  feature: "agent-chat" | "replay-commentary" | "redteam-report";
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
}

const FEATURE_LIMITS: Record<string, number> = {
  "agent-chat": 15,
  "replay-commentary": 5,
  "redteam-report": 5,
};

export async function callGroq(
  options: GroqOptions
): Promise<{ text: string; error?: string }> {
  const limit = FEATURE_LIMITS[options.feature] ?? 5;
  const rateCheck = checkRateLimit(options.feature, limit);

  if (!rateCheck.allowed) {
    return {
      text: "",
      error: "AI analysis is temporarily busy. Try again in a moment.",
    };
  }

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userMessage },
      ],
      max_tokens: options.maxTokens ?? 300,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content ?? "";

    if (!text || text.length > 2000) {
      return { text: "", error: "Commentary could not be generated." };
    }

    return { text };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("429")) {
      return {
        text: "",
        error: "AI analysis is temporarily busy. Try again in a moment.",
      };
    }
    if (error instanceof Error && error.message.includes("503")) {
      return { text: "", error: "AI commentary unavailable." };
    }
    return { text: "", error: "AI features are resting for today." };
  }
}
