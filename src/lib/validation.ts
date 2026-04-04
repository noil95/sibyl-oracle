import { z } from "zod";

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const userIdSchema = z.string().regex(uuidV4Regex, "Invalid user ID");

export const predictSchema = z.object({
  tournamentId: z.string().uuid(),
  probability: z.number().min(0).max(1),
});

export const chatSchema = z.object({
  agentId: z.string().min(1),
  message: z.string().min(1).max(1000),
});

export const watchSourceSchema = z.object({
  predictionSlug: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceType: z.enum(["rss", "webpage"]).default("rss"),
});

export function validateUserId(headers: Headers): string | null {
  const id = headers.get("x-user-id");
  const result = userIdSchema.safeParse(id);
  return result.success ? result.data : null;
}
