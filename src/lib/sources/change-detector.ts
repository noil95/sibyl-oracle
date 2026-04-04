import { createHash } from "crypto";

export async function checkForChanges(
  url: string,
  lastHash: string | null
): Promise<{ changed: boolean; newHash: string; error?: string }> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "SibylOracle/1.0" },
    });

    if (!response.ok) {
      return { changed: false, newHash: lastHash ?? "", error: `HTTP ${response.status}` };
    }

    const text = await response.text();
    const newHash = createHash("md5").update(text).digest("hex");
    const changed = lastHash !== null && newHash !== lastHash;

    return { changed, newHash };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { changed: false, newHash: lastHash ?? "", error: message };
  }
}
