interface BucketState {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketState>();

export function checkRateLimit(
  feature: string,
  maxPerMinute: number
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  let bucket = buckets.get(feature);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + 60_000 };
    buckets.set(feature, bucket);
  }

  if (bucket.count >= maxPerMinute) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count++;
  return { allowed: true };
}
