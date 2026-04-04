# Sibyl Oracle V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Sibyl Oracle from a passive prediction display into an interactive prediction intelligence platform with 8 new features.

**Architecture:** Next.js 16 App Router + Supabase (PostgreSQL + Realtime) + Groq (Llama 3 free tier). All features built as independent pages/API routes sharing a common data layer. User identity via client-generated UUID in localStorage.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase, Groq SDK, d3-force, Recharts, Zod

**Spec:** `docs/superpowers/specs/2026-03-31-sibyl-oracle-v2-design.md`

**IMPORTANT:** This project uses Next.js 16 which has breaking changes. Before writing any code, read relevant docs in `node_modules/next/dist/docs/` per AGENTS.md.

---

## File Structure

### New files to create:

**Shared infrastructure:**
- `src/lib/llm/groq.ts` — Groq API client with rate limiting and failure handling
- `src/lib/llm/rate-limiter.ts` — In-memory rate limiter per feature
- `src/lib/user-id.ts` — Client-side UUID generation and localStorage management
- `src/lib/validation.ts` — Shared Zod schemas for API input validation
- `supabase/migrations/003_v2_features.sql` — All new tables + seed data

**Feature E — Calibration Tournaments:**
- `src/lib/scoring/brier.ts` — Brier score calculation
- `src/app/tournaments/page.tsx` — Tournament listing
- `src/app/tournaments/[id]/page.tsx` — Single tournament view
- `src/app/leaderboard/page.tsx` — Leaderboard
- `src/app/api/tournaments/route.ts` — List/create tournaments
- `src/app/api/tournaments/predict/route.ts` — Submit prediction
- `src/app/api/tournaments/resolve/route.ts` — Resolve tournament
- `src/app/api/cron/resolve-tournaments/route.ts` — Auto-resolve cron
- `src/app/components/TournamentCard.tsx` — Tournament card
- `src/app/components/PredictionSlider.tsx` — Probability slider
- `src/app/components/LeaderboardTable.tsx` — Ranked table

**Feature A — Narrative Fork Explorer:**
- `src/lib/ripple/fork-engine.ts` — Fork computation engine
- `src/app/fork/[slug]/page.tsx` — Fork interface
- `src/app/api/fork/route.ts` — Fork API
- `src/app/components/ForkView.tsx` — Split-screen comparison
- `src/app/components/ForkSlider.tsx` — Override slider

**Feature C — Contagion Heatmap:**
- `src/app/heatmap/page.tsx` — Heatmap page
- `src/app/api/heatmap/route.ts` — Heatmap data API
- `src/app/components/ContagionGraph.tsx` — Force-directed graph

**Feature D — Agent Interrogation Room:**
- `src/lib/agents/personas.json` — Agent persona configs
- `src/lib/agents/context-builder.ts` — LLM context from live data
- `src/app/agents/page.tsx` — Agent grid
- `src/app/agents/[agentId]/page.tsx` — Chat interface
- `src/app/api/agents/chat/route.ts` — Chat API
- `src/app/components/AgentCard.tsx` — Agent preview card
- `src/app/components/AgentChat.tsx` — Chat UI

**Feature G — Simulation Replay:**
- `src/lib/replay/commentary-generator.ts` — LLM commentary
- `src/app/replay/[slug]/page.tsx` — Replay view
- `src/app/api/replay/[slug]/route.ts` — Replay data API
- `src/app/components/ReplayTimeline.tsx` — Timeline with scrubber

**Feature F — Lens View:**
- `src/lib/lens/disaggregator.ts` — Per-source signal query
- `src/app/lens/page.tsx` — Lens comparison page
- `src/app/api/lens/[slug]/route.ts` — Per-source signal API
- `src/app/components/LensComparison.tsx` — Side-by-side cards
- `src/app/components/SourceCard.tsx` — Source signal card

**Feature B — Red Team Mode:**
- `src/lib/redteam/scenarios.json` — Preset shock configs
- `src/lib/redteam/stress-test.ts` — Stress test engine
- `src/app/redteam/page.tsx` — Red team page
- `src/app/api/redteam/route.ts` — Stress test API
- `src/app/components/StressTest.tsx` — Results dashboard
- `src/app/components/ShockBuilder.tsx` — Custom shock builder

**Feature H — Living Documents:**
- `src/lib/sources/change-detector.ts` — URL change detection
- `src/app/api/sources/route.ts` — CRUD watched sources
- `src/app/api/cron/check-sources/route.ts` — Source check cron
- `src/app/api/cron/prune/route.ts` — Data pruning cron
- `src/app/components/WatchSources.tsx` — Watch panel

### Files to modify:
- `src/app/components/DomainNav.tsx` — Add new nav items, remove Globe
- `src/app/components/GenericPredictionCard.tsx` — Add "Predict", "What if?", "Replay" buttons
- `src/lib/db/queries.ts` — Add queries for new tables
- `src/app/profile/page.tsx` — Replace Oracle Score with tournament rank
- `package.json` — Add groq-sdk, d3-force dependencies

### Files to delete:
- `src/app/globe/page.tsx`
- `src/app/components/GlobeView.tsx`
- `src/app/components/MiniGlobe.tsx`
- `src/lib/gamification/oracle-score.ts`
- `src/lib/gamification/badges.ts`
- `src/lib/gamification/streak.ts`
- `src/app/components/OracleScore.tsx`
- `src/lib/impact/templates.ts`
- `src/lib/impact/data/impact-map.json`
- `src/app/api/impact/route.ts`
- `src/app/components/ImpactPanel.tsx`
- `src/lib/ripple/data/ripple-chains.json`

---

## Phase 1 — Foundation

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install new packages**

```bash
cd "C:/Users/klaud/Project Big Brain/sibyl-oracle"
npm install groq-sdk d3-force @types/d3-force
```

- [ ] **Step 2: Add GROQ_API_KEY to .env.local**

```bash
echo 'GROQ_API_KEY=' >> .env.local
```

User must get a free key from https://console.groq.com and paste it in.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.local
git commit -m "chore: add groq-sdk and d3-force dependencies"
```

---

### Task 2: User identity system

**Files:**
- Create: `src/lib/user-id.ts`

- [ ] **Step 1: Create user-id utility**

```typescript
// src/lib/user-id.ts
"use client";

const STORAGE_KEY = "sibyl-user-id";

export function getUserId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function exportUserId(): string {
  return getUserId();
}

export function importUserId(id: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidV4Regex.test(id)) return false;
  localStorage.setItem(STORAGE_KEY, id);
  return true;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/user-id.ts
git commit -m "feat: add client-side user identity system"
```

---

### Task 3: Shared validation schemas

**Files:**
- Create: `src/lib/validation.ts`

- [ ] **Step 1: Create validation module**

```typescript
// src/lib/validation.ts
import { z } from "zod/v4";

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
```

Note: Check if Zod v4 uses `z.string().uuid()` or a different API. Read the zod package to confirm. If using Zod 4.x (which this project has), imports may differ — check `node_modules/zod/package.json` for the correct entry point.

- [ ] **Step 2: Commit**

```bash
git add src/lib/validation.ts
git commit -m "feat: add shared Zod validation schemas"
```

---

### Task 4: Groq LLM client with rate limiting

**Files:**
- Create: `src/lib/llm/rate-limiter.ts`
- Create: `src/lib/llm/groq.ts`

- [ ] **Step 1: Create rate limiter**

```typescript
// src/lib/llm/rate-limiter.ts

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
```

- [ ] **Step 2: Create Groq client**

```typescript
// src/lib/llm/groq.ts
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
```

- [ ] **Step 3: Verify Groq SDK import works**

```bash
cd "C:/Users/klaud/Project Big Brain/sibyl-oracle"
npx tsc --noEmit src/lib/llm/groq.ts 2>&1 || echo "Check import path"
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/llm/
git commit -m "feat: add Groq LLM client with rate limiting"
```

---

### Task 5: Database migration — all new tables

**Files:**
- Create: `supabase/migrations/003_v2_features.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- 003_v2_features.sql
-- Sibyl Oracle V2: Tournaments, Relationships, Replay, Sources

-- 1. Prediction relationships (shared by Fork, Heatmap, Red Team)
CREATE TABLE IF NOT EXISTS prediction_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_slug text NOT NULL,
  target_slug text NOT NULL,
  multiplier float NOT NULL,
  lag_description text,
  UNIQUE(source_slug, target_slug)
);

-- 2. Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_slug text NOT NULL,
  title text NOT NULL,
  description text,
  closes_at timestamptz NOT NULL,
  resolves_at timestamptz,
  resolution text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

-- 3. User predictions
CREATE TABLE IF NOT EXISTS user_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  predicted_probability float NOT NULL,
  predicted_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- 4. Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  user_id text PRIMARY KEY,
  display_name text,
  total_predictions int DEFAULT 0,
  total_brier_sum float DEFAULT 0,
  total_resolved int DEFAULT 0,
  rank_title text DEFAULT 'Novice',
  streak int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- 5. Replay commentary
CREATE TABLE IF NOT EXISTS replay_commentary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_slug text NOT NULL,
  timestamp timestamptz NOT NULL,
  signal_snapshot jsonb NOT NULL,
  commentary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. Watched sources
CREATE TABLE IF NOT EXISTS watched_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  prediction_slug text NOT NULL,
  source_url text NOT NULL,
  source_type text DEFAULT 'rss',
  last_hash text,
  last_checked timestamptz,
  fail_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_user_predictions_tournament ON user_predictions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_user ON user_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_type_source ON signals(prediction_type_id, source);
CREATE INDEX IF NOT EXISTS idx_predictions_type_created ON predictions(prediction_type_id, created_at);
CREATE INDEX IF NOT EXISTS idx_replay_commentary_slug ON replay_commentary(prediction_slug, timestamp);
CREATE INDEX IF NOT EXISTS idx_watched_sources_user ON watched_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);

-- 8. Seed prediction_relationships (~30 rows)
INSERT INTO prediction_relationships (source_slug, target_slug, multiplier, lag_description) VALUES
  -- Fed rate impacts
  ('fed-rate', 'housing-market', -0.7, 'within weeks'),
  ('fed-rate', 'sp500', -0.4, 'within days'),
  ('fed-rate', 'dollar-strength', 0.6, 'within days'),
  ('fed-rate', 'gold-price', -0.3, 'within weeks'),
  ('fed-rate', 'bitcoin', -0.5, 'within days'),
  -- Inflation chain
  ('inflation', 'fed-rate', 0.8, 'within months'),
  ('inflation', 'gold-price', 0.5, 'within weeks'),
  ('inflation', 'consumer-spending', -0.4, 'within weeks'),
  -- Oil impacts
  ('oil-price', 'inflation', 0.6, 'within weeks'),
  ('oil-price', 'transport-costs', 0.7, 'within days'),
  ('oil-price', 'consumer-spending', -0.3, 'within months'),
  -- S&P 500 cascades
  ('sp500', 'tech-layoffs', -0.6, 'within months'),
  ('sp500', 'consumer-confidence', 0.5, 'within weeks'),
  ('sp500', 'bitcoin', 0.3, 'within days'),
  -- Bitcoin/crypto
  ('bitcoin', 'ethereum', 0.8, 'within days'),
  ('bitcoin', 'crypto-regulation', 0.4, 'within months'),
  -- Tech sector
  ('ai-regulation', 'tech-stocks', -0.5, 'within weeks'),
  ('ai-regulation', 'ai-investment', -0.3, 'within months'),
  ('tech-layoffs', 'remote-work', -0.5, 'within months'),
  ('tech-stocks', 'sp500', 0.3, 'within days'),
  -- GDP/unemployment
  ('gdp-growth', 'unemployment', -0.6, 'within months'),
  ('gdp-growth', 'sp500', 0.4, 'within weeks'),
  ('unemployment', 'consumer-spending', -0.5, 'within weeks'),
  ('unemployment', 'housing-market', -0.4, 'within months'),
  -- Housing
  ('housing-market', 'consumer-confidence', 0.3, 'within months'),
  -- Dollar
  ('dollar-strength', 'gold-price', -0.5, 'within days'),
  ('dollar-strength', 'bitcoin', -0.3, 'within days'),
  -- Cross-domain
  ('consumer-confidence', 'sp500', 0.3, 'within weeks'),
  ('crypto-regulation', 'bitcoin', -0.7, 'within days'),
  ('crypto-regulation', 'ethereum', -0.6, 'within days')
ON CONFLICT (source_slug, target_slug) DO NOTHING;

-- 9. Seed initial tournaments
INSERT INTO tournaments (prediction_slug, title, description, closes_at, resolves_at) VALUES
  ('fed-rate', 'Will the Fed raise rates in May 2026?', 'Predict whether the Federal Reserve will increase the federal funds rate at their May meeting.', now() + interval '30 days', now() + interval '35 days'),
  ('bitcoin', 'Will Bitcoin exceed $100K by June 2026?', 'Predict whether Bitcoin will trade above $100,000 USD before June 30, 2026.', now() + interval '60 days', now() + interval '90 days'),
  ('sp500', 'S&P 500 direction next month', 'Will the S&P 500 close higher next month than today?', now() + interval '30 days', now() + interval '32 days'),
  ('unemployment', 'US unemployment above 5% by Q3?', 'Predict whether US unemployment rate will exceed 5% by September 2026.', now() + interval '120 days', now() + interval '150 days'),
  ('ai-regulation', 'Major AI regulation passed by 2026 end?', 'Will the US or EU pass comprehensive AI regulation before December 31, 2026?', now() + interval '180 days', now() + interval '270 days')
;
```

- [ ] **Step 2: Run migration in Supabase SQL Editor**

Copy the SQL above and run it in the Supabase dashboard SQL Editor at https://supabase.com/dashboard.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/003_v2_features.sql
git commit -m "feat: add V2 database migration with tables and seed data"
```

---

### Task 6: Add database queries for new tables

**Files:**
- Modify: `src/lib/db/queries.ts`

- [ ] **Step 1: Add tournament queries to queries.ts**

Append the following functions to `src/lib/db/queries.ts`:

```typescript
// ── Tournaments ──

export async function getOpenTournaments() {
  const { data, error } = await supabaseAdmin
    .from("tournaments")
    .select("*")
    .eq("status", "open")
    .order("closes_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getTournamentById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function submitPrediction(
  tournamentId: string,
  userId: string,
  probability: number
) {
  const { data, error } = await supabaseAdmin
    .from("user_predictions")
    .upsert(
      { tournament_id: tournamentId, user_id: userId, predicted_probability: probability },
      { onConflict: "tournament_id,user_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getTournamentPredictions(tournamentId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_predictions")
    .select("*")
    .eq("tournament_id", tournamentId);
  if (error) throw error;
  return data;
}

export async function resolveTournament(
  tournamentId: string,
  resolution: string
) {
  const { error } = await supabaseAdmin
    .from("tournaments")
    .update({ status: "resolved", resolution })
    .eq("id", tournamentId);
  if (error) throw error;
}

// ── Leaderboard ──

export async function getLeaderboard(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from("leaderboard")
    .select("*")
    .order("total_brier_sum", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function upsertLeaderboardEntry(
  userId: string,
  brierScore: number,
  displayName?: string
) {
  // First try to get existing
  const { data: existing } = await supabaseAdmin
    .from("leaderboard")
    .select("*")
    .eq("user_id", userId)
    .single();

  const totalBrier = (existing?.total_brier_sum ?? 0) + brierScore;
  const totalResolved = (existing?.total_resolved ?? 0) + 1;
  const totalPredictions = (existing?.total_predictions ?? 0) + 1;

  // Determine rank
  let rankTitle = "Novice";
  if (totalPredictions >= 100) rankTitle = "Oracle";
  else if (totalPredictions >= 50) rankTitle = "Strategist";
  else if (totalPredictions >= 10) rankTitle = "Analyst";

  const { error } = await supabaseAdmin
    .from("leaderboard")
    .upsert({
      user_id: userId,
      display_name: displayName ?? existing?.display_name,
      total_predictions: totalPredictions,
      total_brier_sum: totalBrier,
      total_resolved: totalResolved,
      rank_title: rankTitle,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

// ── Prediction Relationships ──

export async function getPredictionRelationships() {
  const { data, error } = await supabaseAdmin
    .from("prediction_relationships")
    .select("*");
  if (error) throw error;
  return data;
}

export async function getRelationshipsForSlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("prediction_relationships")
    .select("*")
    .or(`source_slug.eq.${slug},target_slug.eq.${slug}`);
  if (error) throw error;
  return data;
}

// ── Replay Commentary ──

export async function getCachedCommentary(predictionSlug: string) {
  const { data, error } = await supabaseAdmin
    .from("replay_commentary")
    .select("*")
    .eq("prediction_slug", predictionSlug)
    .order("timestamp", { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertCommentary(
  predictionSlug: string,
  timestamp: string,
  signalSnapshot: unknown,
  commentary: string
) {
  const { error } = await supabaseAdmin
    .from("replay_commentary")
    .insert({
      prediction_slug: predictionSlug,
      timestamp,
      signal_snapshot: signalSnapshot,
      commentary,
    });
  if (error) throw error;
}

// ── Watched Sources ──

export async function getWatchedSources(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("watched_sources")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function addWatchedSource(
  userId: string,
  predictionSlug: string,
  sourceUrl: string,
  sourceType: string
) {
  // Check user limit (max 5)
  const existing = await getWatchedSources(userId);
  if (existing.length >= 5) {
    throw new Error("Maximum 5 watched sources per user");
  }

  // Check system limit (max 100)
  const { count } = await supabaseAdmin
    .from("watched_sources")
    .select("*", { count: "exact", head: true });
  if ((count ?? 0) >= 100) {
    throw new Error("System source limit reached");
  }

  const { data, error } = await supabaseAdmin
    .from("watched_sources")
    .insert({ user_id: userId, prediction_slug: predictionSlug, source_url: sourceUrl, source_type: sourceType })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeWatchedSource(id: string, userId: string) {
  const { error } = await supabaseAdmin
    .from("watched_sources")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

// ── Signals by source (for Lens View) ──

export async function getSignalsBySource(predictionTypeId: string) {
  const { data, error } = await supabaseAdmin
    .from("signals")
    .select("*")
    .eq("prediction_type_id", predictionTypeId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db/queries.ts
git commit -m "feat: add database queries for tournaments, leaderboard, relationships, replay, sources"
```

---

### Task 7: Brier scoring module

**Files:**
- Create: `src/lib/scoring/brier.ts`

- [ ] **Step 1: Create Brier score calculator**

```typescript
// src/lib/scoring/brier.ts

/**
 * Calculate Brier score for a single prediction.
 * Brier = (predicted - actual)^2
 * Lower is better. 0 = perfect, 1 = worst possible.
 *
 * @param predicted - probability the user predicted (0-1)
 * @param actualOutcome - 1 if event happened, 0 if not
 */
export function brierScore(predicted: number, actualOutcome: number): number {
  return (predicted - actualOutcome) ** 2;
}

/**
 * Convert a tournament resolution string to a numeric outcome.
 * 'yes'|'up' = 1, 'no'|'down' = 0, 'stable' = 0.5
 */
export function resolutionToOutcome(resolution: string): number {
  switch (resolution.toLowerCase()) {
    case "yes":
    case "up":
      return 1;
    case "no":
    case "down":
      return 0;
    case "stable":
      return 0.5;
    default:
      return 0.5;
  }
}

/**
 * Determine rank title based on prediction count.
 */
export function getRankTitle(totalPredictions: number): string {
  if (totalPredictions >= 100) return "Oracle";
  if (totalPredictions >= 50) return "Strategist";
  if (totalPredictions >= 10) return "Analyst";
  return "Novice";
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/scoring/brier.ts
git commit -m "feat: add Brier score calculation module"
```

---

### Task 8: Cut dead features

**Files:**
- Delete: Globe, gamification, impact, static ripple chains (see list above)
- Modify: `src/app/components/DomainNav.tsx` — remove Globe link

- [ ] **Step 1: Delete files**

```bash
cd "C:/Users/klaud/Project Big Brain/sibyl-oracle"
rm -f src/app/globe/page.tsx
rmdir src/app/globe 2>/dev/null
rm -f src/app/components/GlobeView.tsx
rm -f src/app/components/MiniGlobe.tsx
rm -f src/lib/gamification/oracle-score.ts
rm -f src/lib/gamification/badges.ts
rm -f src/lib/gamification/streak.ts
rmdir src/lib/gamification 2>/dev/null
rm -f src/app/components/OracleScore.tsx
rm -f src/lib/impact/templates.ts
rm -f src/lib/impact/data/impact-map.json
rmdir src/lib/impact/data 2>/dev/null
rmdir src/lib/impact 2>/dev/null
rm -f src/app/api/impact/route.ts
rmdir src/app/api/impact 2>/dev/null
rm -f src/app/components/ImpactPanel.tsx
rm -f src/lib/ripple/data/ripple-chains.json
```

- [ ] **Step 2: Update DomainNav.tsx**

Remove the Globe link from the navigation array. Replace it with "Heatmap" (to be built in Phase 2). Add "Tournaments", "Leaderboard", and "Agents" links.

Read the current DomainNav.tsx first to understand its structure, then edit the links array.

- [ ] **Step 3: Fix ripple engine import**

The file `src/lib/ripple/engine.ts` line 4 imports `ripple-chains.json` which we just deleted. The fork engine (Task 11) will replace this with database queries. For now, make `getAllChains()` return an empty array and remove the import:

```typescript
// Remove: import rippleChainsData from "./data/ripple-chains.json";
// Replace getAllChains body:
export function getAllChains(): ChainConfig[] {
  return [];
}
```

- [ ] **Step 4: Remove references to deleted components**

Search for imports of `OracleScore`, `ImpactPanel`, `GlobeView`, `MiniGlobe` in all files and remove them. Key files to check:
- `src/app/profile/page.tsx` — likely imports OracleScore
- `src/app/politics/page.tsx` — likely imports ImpactPanel
- `src/app/globe/page.tsx` — already deleted
- Any component importing MiniGlobe

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Fix any remaining broken imports.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove Globe, Oracle Score, Impact templates, static ripple chains"
```

---

### Task 9: Tournament API routes

**Files:**
- Create: `src/app/api/tournaments/route.ts`
- Create: `src/app/api/tournaments/predict/route.ts`
- Create: `src/app/api/tournaments/resolve/route.ts`
- Create: `src/app/api/cron/resolve-tournaments/route.ts`

- [ ] **Step 1: Create tournament list/create route**

```typescript
// src/app/api/tournaments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenTournaments, getTournamentPredictions } from "@/lib/db/queries";

export async function GET() {
  const tournaments = await getOpenTournaments();

  // Add participant count to each tournament
  const withCounts = await Promise.all(
    tournaments.map(async (t: { id: string }) => {
      const preds = await getTournamentPredictions(t.id);
      return { ...t, participantCount: preds.length };
    })
  );

  return NextResponse.json({ tournaments: withCounts });
}
```

- [ ] **Step 2: Create prediction submission route**

```typescript
// src/app/api/tournaments/predict/route.ts
import { NextRequest, NextResponse } from "next/server";
import { predictSchema, validateUserId } from "@/lib/validation";
import { getTournamentById, submitPrediction } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const userId = validateUserId(request.headers);
  if (!userId) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = predictSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { tournamentId, probability } = parsed.data;

  // Check tournament exists and is open
  const tournament = await getTournamentById(tournamentId);
  if (!tournament || tournament.status !== "open") {
    return NextResponse.json({ error: "Tournament not open" }, { status: 400 });
  }

  // Check not past closing time
  if (new Date(tournament.closes_at) < new Date()) {
    return NextResponse.json({ error: "Tournament closed" }, { status: 400 });
  }

  const prediction = await submitPrediction(tournamentId, userId, probability);
  return NextResponse.json({ prediction });
}
```

- [ ] **Step 3: Create tournament resolution route**

```typescript
// src/app/api/tournaments/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getTournamentById,
  getTournamentPredictions,
  resolveTournament,
  upsertLeaderboardEntry,
} from "@/lib/db/queries";
import { brierScore, resolutionToOutcome } from "@/lib/scoring/brier";

export async function POST(request: NextRequest) {
  // Auth: require CRON_SECRET
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tournamentId, resolution } = await request.json();

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Resolve tournament
  await resolveTournament(tournamentId, resolution);

  // Score all participants
  const predictions = await getTournamentPredictions(tournamentId);
  const outcome = resolutionToOutcome(resolution);

  for (const pred of predictions) {
    const score = brierScore(pred.predicted_probability, outcome);
    await upsertLeaderboardEntry(pred.user_id, score);
  }

  return NextResponse.json({
    resolved: true,
    participants: predictions.length,
  });
}
```

- [ ] **Step 4: Create auto-resolve cron route**

```typescript
// src/app/api/cron/resolve-tournaments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import {
  getTournamentPredictions,
  resolveTournament,
  upsertLeaderboardEntry,
} from "@/lib/db/queries";
import { brierScore, resolutionToOutcome } from "@/lib/scoring/brier";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find tournaments past resolves_at that are still 'open' or 'closed'
  const { data: tournaments } = await supabaseAdmin
    .from("tournaments")
    .select("*")
    .in("status", ["open", "closed"])
    .lt("resolves_at", new Date().toISOString());

  if (!tournaments?.length) {
    return NextResponse.json({ resolved: 0 });
  }

  let resolvedCount = 0;

  for (const t of tournaments) {
    // Auto-close if past closes_at
    if (t.status === "open" && new Date(t.closes_at) < new Date()) {
      await supabaseAdmin
        .from("tournaments")
        .update({ status: "closed" })
        .eq("id", t.id);
    }

    // For now, skip auto-resolution — needs manual resolution
    // or comparison against live prediction data
    // TODO: Compare prediction_slug's current score to determine outcome
  }

  return NextResponse.json({ resolved: resolvedCount });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/tournaments/ src/app/api/cron/resolve-tournaments/
git commit -m "feat: add tournament API routes (list, predict, resolve, auto-resolve cron)"
```

---

### Task 10: Tournament frontend pages and components

**Files:**
- Create: `src/app/components/TournamentCard.tsx`
- Create: `src/app/components/PredictionSlider.tsx`
- Create: `src/app/components/LeaderboardTable.tsx`
- Create: `src/app/tournaments/page.tsx`
- Create: `src/app/tournaments/[id]/page.tsx`
- Create: `src/app/leaderboard/page.tsx`

- [ ] **Step 1: Create TournamentCard component**

A card showing tournament title, prediction slug, time remaining, participant count. Links to `/tournaments/[id]`. Use the existing card styling from GenericPredictionCard as reference for consistent design.

- [ ] **Step 2: Create PredictionSlider component**

A range slider (0-100%) with a submit button. Shows the current value as a large percentage. Uses `getUserId()` from `src/lib/user-id.ts` and sends POST to `/api/tournaments/predict` with `X-User-Id` header.

- [ ] **Step 3: Create LeaderboardTable component**

A table showing: rank, display name, Brier score (total_brier_sum / total_resolved), total predictions, rank title badge. Fetches from `/api/leaderboard` (need to create this GET route too — simple wrapper around `getLeaderboard()` query).

- [ ] **Step 4: Create tournaments listing page**

```
src/app/tournaments/page.tsx
```
- Fetches from `/api/tournaments`
- Wraps in AppShell
- Renders grid of TournamentCard components
- Shows "No active tournaments" empty state

- [ ] **Step 5: Create tournament detail page**

```
src/app/tournaments/[id]/page.tsx
```
- Fetches tournament by ID
- Shows tournament title, description, time remaining
- Renders PredictionSlider for user to submit
- Shows aggregate stats (avg prediction, participant count)
- If resolved, shows outcome and user's Brier score

- [ ] **Step 6: Create leaderboard page**

```
src/app/leaderboard/page.tsx
```
- Wraps in AppShell
- Renders LeaderboardTable
- Highlights current user's row

- [ ] **Step 7: Add leaderboard API route**

Create `src/app/api/leaderboard/route.ts` — simple GET that calls `getLeaderboard()`.

- [ ] **Step 8: Verify build**

```bash
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add src/app/tournaments/ src/app/leaderboard/ src/app/components/TournamentCard.tsx src/app/components/PredictionSlider.tsx src/app/components/LeaderboardTable.tsx src/app/api/leaderboard/
git commit -m "feat: add tournament pages, leaderboard, and prediction slider UI"
```

---

## Phase 2 — Interactive Intelligence

### Task 11: Fork engine

**Files:**
- Create: `src/lib/ripple/fork-engine.ts`
- Create: `src/app/api/fork/route.ts`

- [ ] **Step 1: Create fork engine**

```typescript
// src/lib/ripple/fork-engine.ts
import { getPredictionRelationships } from "@/lib/db/queries";

interface ForkResult {
  slug: string;
  originalScore: number;
  forkedScore: number;
  delta: number;
  direction: "up" | "down" | "stable";
}

/**
 * Compute cascading effects of overriding one or more predictions.
 * Traverses prediction_relationships recursively (max depth 4).
 */
export async function computeFork(
  overrides: Record<string, number>,
  currentScores: Record<string, number>
): Promise<ForkResult[]> {
  const relationships = await getPredictionRelationships();
  const results = new Map<string, ForkResult>();

  // Initialize overridden predictions
  for (const [slug, newScore] of Object.entries(overrides)) {
    const original = currentScores[slug] ?? 0.5;
    results.set(slug, {
      slug,
      originalScore: original,
      forkedScore: newScore,
      delta: newScore - original,
      direction: newScore > original + 0.05 ? "up" : newScore < original - 0.05 ? "down" : "stable",
    });
  }

  // BFS through relationships, max depth 4
  const queue: Array<{ slug: string; depth: number }> = Object.keys(overrides).map(
    (slug) => ({ slug, depth: 0 })
  );
  const visited = new Set<string>(Object.keys(overrides));

  while (queue.length > 0) {
    const { slug, depth } = queue.shift()!;
    if (depth >= 4) continue;

    const parentResult = results.get(slug);
    if (!parentResult) continue;

    // Find downstream relationships
    const downstream = relationships.filter(
      (r: { source_slug: string }) => r.source_slug === slug
    );

    for (const rel of downstream) {
      if (visited.has(rel.target_slug)) continue;
      visited.add(rel.target_slug);

      const originalScore = currentScores[rel.target_slug] ?? 0.5;
      const cascadeDelta = parentResult.delta * rel.multiplier;
      const forkedScore = Math.max(0.05, Math.min(0.95, originalScore + cascadeDelta));

      const result: ForkResult = {
        slug: rel.target_slug,
        originalScore,
        forkedScore,
        delta: cascadeDelta,
        direction: cascadeDelta > 0.05 ? "up" : cascadeDelta < -0.05 ? "down" : "stable",
      };

      results.set(rel.target_slug, result);
      queue.push({ slug: rel.target_slug, depth: depth + 1 });
    }
  }

  return Array.from(results.values());
}
```

- [ ] **Step 2: Create fork API route**

```typescript
// src/app/api/fork/route.ts
import { NextRequest, NextResponse } from "next/server";
import { computeFork } from "@/lib/ripple/fork-engine";
import { getLatestDomainPredictions } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const overridesParam = params.get("overrides"); // JSON: {"fed-rate": 0.8}

  if (!overridesParam) {
    return NextResponse.json({ error: "Missing overrides param" }, { status: 400 });
  }

  let overrides: Record<string, number>;
  try {
    overrides = JSON.parse(overridesParam);
  } catch {
    return NextResponse.json({ error: "Invalid overrides JSON" }, { status: 400 });
  }

  // Get current scores for all domains
  const [economic, tech] = await Promise.all([
    getLatestDomainPredictions("economic"),
    getLatestDomainPredictions("tech"),
  ]);

  const currentScores: Record<string, number> = {};
  for (const p of [...(economic ?? []), ...(tech ?? [])]) {
    if (p.slug) currentScores[p.slug] = p.probability ?? 0.5;
  }

  const results = await computeFork(overrides, currentScores);
  return NextResponse.json({ forkResults: results, overrides });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/ripple/fork-engine.ts src/app/api/fork/
git commit -m "feat: add fork engine with cascading prediction overrides"
```

---

### Task 12: Fork Explorer frontend

**Files:**
- Create: `src/app/fork/[slug]/page.tsx`
- Create: `src/app/components/ForkView.tsx`
- Create: `src/app/components/ForkSlider.tsx`

- [ ] **Step 1: Create ForkSlider component**

A range input slider (0-100%) that shows the override value. Props: `slug`, `label`, `currentValue`, `onChange`.

- [ ] **Step 2: Create ForkView component**

Split-screen layout. Left column: "Current Reality" with original scores. Right column: "Your Scenario" with forked scores. Each row shows prediction name, original%, forked%, and delta with color coding (green up, red down).

- [ ] **Step 3: Create fork page**

```
src/app/fork/[slug]/page.tsx
```
- URL param `slug` pre-selects which prediction to fork
- Renders ForkSlider for the main prediction + up to 4 additional overrides
- Fetches `/api/fork?overrides=...` on each slider change (debounced 300ms)
- Renders ForkView with results
- Share button copies the current URL with encoded overrides

- [ ] **Step 4: Add "What if?" link to GenericPredictionCard**

Modify `src/app/components/GenericPredictionCard.tsx` to add a small "What if?" link that navigates to `/fork/[slug]`.

- [ ] **Step 5: Verify build and commit**

```bash
npm run build
git add src/app/fork/ src/app/components/ForkView.tsx src/app/components/ForkSlider.tsx src/app/components/GenericPredictionCard.tsx
git commit -m "feat: add Narrative Fork Explorer with split-screen comparison"
```

---

### Task 13: Contagion Heatmap

**Files:**
- Create: `src/app/heatmap/page.tsx`
- Create: `src/app/api/heatmap/route.ts`
- Create: `src/app/components/ContagionGraph.tsx`

- [ ] **Step 1: Create heatmap API route**

```typescript
// src/app/api/heatmap/route.ts
import { NextResponse } from "next/server";
import {
  getLatestDomainPredictions,
  getPredictionRelationships,
} from "@/lib/db/queries";

export async function GET() {
  const [economic, tech, relationships] = await Promise.all([
    getLatestDomainPredictions("economic"),
    getLatestDomainPredictions("tech"),
    getPredictionRelationships(),
  ]);

  const predictions = [...(economic ?? []), ...(tech ?? [])];

  const nodes = predictions.map((p: { slug: string; name: string; domain: string; probability: number; confidence: number }) => ({
    id: p.slug,
    label: p.name,
    domain: p.domain,
    score: p.probability ?? 0.5,
    confidence: p.confidence ?? 0.5,
  }));

  const edges = relationships.map((r: { source_slug: string; target_slug: string; multiplier: number }) => ({
    source: r.source_slug,
    target: r.target_slug,
    multiplier: r.multiplier,
  }));

  return NextResponse.json({ nodes, edges });
}
```

- [ ] **Step 2: Create ContagionGraph component**

A client component that:
1. Fetches `/api/heatmap` on mount
2. Uses `d3-force` to calculate node positions (forceSimulation, forceLink, forceCharge, forceCenter)
3. Renders as SVG with:
   - Circle nodes sized by confidence, colored by domain (purple=economy, blue=tech, red=politics, gold=crypto)
   - Line edges with thickness proportional to |multiplier|
   - Node labels showing prediction name + score%
   - Click handler on nodes to navigate to `/fork/[slug]`
4. CSS keyframe animation for "pulse" effect on edges when data refreshes

Use `useRef` for the SVG element and `useEffect` for d3-force simulation.

- [ ] **Step 3: Create heatmap page**

Wrap ContagionGraph in AppShell. Full-width layout. Title: "Prediction Network".

- [ ] **Step 4: Update DomainNav**

Replace the "Globe" nav item with "Heatmap" pointing to `/heatmap`.

- [ ] **Step 5: Verify build and commit**

```bash
npm run build
git add src/app/heatmap/ src/app/api/heatmap/ src/app/components/ContagionGraph.tsx src/app/components/DomainNav.tsx
git commit -m "feat: add Contagion Heatmap with d3-force network visualization"
```

---

## Phase 3 — AI Layer

### Task 14: Agent personas and context builder

**Files:**
- Create: `src/lib/agents/personas.json`
- Create: `src/lib/agents/context-builder.ts`

- [ ] **Step 1: Create personas.json**

Write the full 6-agent persona config as specified in the design spec. Include complete `systemPrompt` for each agent (not truncated). Each prompt should be 3-5 sentences instructing the LLM on personality, tone, domain expertise, and how to reference live data.

- [ ] **Step 2: Create context builder**

```typescript
// src/lib/agents/context-builder.ts
import { getLatestDomainPredictions } from "@/lib/db/queries";

export async function buildAgentContext(domain: string): Promise<string> {
  const predictions = await getLatestDomainPredictions(domain);

  if (!predictions?.length) {
    return "No live prediction data available at this time.";
  }

  const lines = predictions.map(
    (p: { name: string; probability: number; direction: string }) =>
      `- ${p.name}: ${Math.round((p.probability ?? 0.5) * 100)}% (${p.direction ?? "stable"})`
  );

  return `Current live predictions for ${domain}:\n${lines.join("\n")}`;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/agents/
git commit -m "feat: add agent personas and context builder"
```

---

### Task 15: Agent chat API and frontend

**Files:**
- Create: `src/app/api/agents/chat/route.ts`
- Create: `src/app/agents/page.tsx`
- Create: `src/app/agents/[agentId]/page.tsx`
- Create: `src/app/components/AgentCard.tsx`
- Create: `src/app/components/AgentChat.tsx`

- [ ] **Step 1: Create chat API route**

POST handler that:
1. Validates `X-User-Id` header (UUID format)
2. Validates body with `chatSchema` (agentId, message)
3. Loads agent persona from personas.json
4. Builds context via `buildAgentContext(agent.domain)`
5. Calls `callGroq()` with agent's systemPrompt + context + user message
6. Returns `{ response: string, error?: string }`

Include per-user rate limiting: track `Map<userId, { count, resetAt }>` in module scope. Max 20 messages per hour per user.

- [ ] **Step 2: Create AgentCard component**

Card showing: agent name, avatar emoji (based on bias: bull/bear/neutral), personality description, domain badge, bias badge. Click navigates to `/agents/[agentId]`.

- [ ] **Step 3: Create AgentChat component**

Chat interface with:
- Message list (alternating user/agent bubbles)
- Input field + send button
- Typing indicator during API call
- Chat history in localStorage under `sibyl-chat-[agentId]`
- Sends `X-User-Id` header with every request

- [ ] **Step 4: Create agents listing page**

Grid of 6 AgentCards wrapped in AppShell.

- [ ] **Step 5: Create agent chat page**

Loads agent by ID from personas.json. Renders AgentChat component. Shows agent name and personality in header.

- [ ] **Step 6: Verify build and commit**

```bash
npm run build
git add src/app/agents/ src/app/api/agents/ src/app/components/AgentCard.tsx src/app/components/AgentChat.tsx
git commit -m "feat: add Agent Interrogation Room with 6 AI personas"
```

---

### Task 16: Simulation Replay with Commentary

**Files:**
- Create: `src/lib/replay/commentary-generator.ts`
- Create: `src/app/api/replay/[slug]/route.ts`
- Create: `src/app/replay/[slug]/page.tsx`
- Create: `src/app/components/ReplayTimeline.tsx`

- [ ] **Step 1: Create commentary generator**

```typescript
// src/lib/replay/commentary-generator.ts
import { callGroq } from "@/lib/llm/groq";
import { insertCommentary } from "@/lib/db/queries";

interface SignalSnapshot {
  source: string;
  score: number;
  raw_data?: unknown;
}

export async function generateCommentary(
  predictionSlug: string,
  timestamp: string,
  signals: SignalSnapshot[],
  previousScore: number,
  currentScore: number
): Promise<string> {
  const direction = currentScore > previousScore ? "increased" : "decreased";
  const delta = Math.abs(Math.round((currentScore - previousScore) * 100));

  const signalSummary = signals
    .map((s) => `${s.source}: ${Math.round(s.score * 100)}%`)
    .join(", ");

  const prompt = `The prediction "${predictionSlug}" ${direction} by ${delta} percentage points. Signal data: ${signalSummary}. Write a brief 1-2 sentence explanation of what likely caused this shift. Be specific and reference the data sources.`;

  const result = await callGroq({
    feature: "replay-commentary",
    systemPrompt:
      "You are a financial data analyst providing brief, factual commentary on prediction changes. Reference specific data sources. No speculation. Max 2 sentences.",
    userMessage: prompt,
    maxTokens: 150,
  });

  if (result.text) {
    await insertCommentary(
      predictionSlug,
      timestamp,
      signals,
      result.text
    );
  }

  return result.text || result.error || "Commentary unavailable.";
}
```

- [ ] **Step 2: Create replay API route**

GET handler that:
1. Gets prediction history for the slug (last 30 days)
2. Identifies inflection points (>5% shift between consecutive entries)
3. For each inflection, checks for cached commentary in `replay_commentary` table
4. If not cached, generates commentary lazily
5. Returns `{ history: [...], inflections: [{ timestamp, delta, commentary }] }`

- [ ] **Step 3: Create ReplayTimeline component**

Recharts-based line chart showing probability over time. Inflection points marked with dots. Timeline scrubber (range input) below the chart. When scrubber reaches an inflection point, commentary card appears below.

- [ ] **Step 4: Create replay page**

Wraps ReplayTimeline in AppShell. Shows prediction name and current score in header.

- [ ] **Step 5: Add "Replay" link to GenericPredictionCard**

Small link/button that navigates to `/replay/[slug]`.

- [ ] **Step 6: Verify build and commit**

```bash
npm run build
git add src/lib/replay/ src/app/api/replay/ src/app/replay/ src/app/components/ReplayTimeline.tsx src/app/components/GenericPredictionCard.tsx
git commit -m "feat: add Simulation Replay with LLM commentary"
```

---

## Phase 4 — Advanced Features

### Task 17: Lens View (Cross-Platform Stitching)

**Files:**
- Create: `src/lib/lens/disaggregator.ts`
- Create: `src/app/api/lens/[slug]/route.ts`
- Create: `src/app/lens/page.tsx`
- Create: `src/app/components/LensComparison.tsx`
- Create: `src/app/components/SourceCard.tsx`

- [ ] **Step 1: Create disaggregator**

Queries `signals` table grouped by `source` for a given prediction_type_id. Returns per-source scores with latest values. Calculates "consensus gap" = max(scores) - min(scores).

- [ ] **Step 2: Create lens API route**

GET `/api/lens/[slug]` — resolves slug to prediction_type_id, calls disaggregator, returns per-source breakdown.

- [ ] **Step 3: Create SourceCard component**

Individual card showing: source icon/name, score bar (0-100%), direction arrow, last updated timestamp. Highlight if this source is the outlier (furthest from mean).

- [ ] **Step 4: Create LensComparison component**

Side-by-side grid of SourceCards. Consensus gap indicator at top (green = agreement, red = disagreement).

- [ ] **Step 5: Create lens page**

Prediction picker dropdown + LensComparison. Wrapped in AppShell.

- [ ] **Step 6: Verify build and commit**

```bash
npm run build
git add src/lib/lens/ src/app/api/lens/ src/app/lens/ src/app/components/LensComparison.tsx src/app/components/SourceCard.tsx
git commit -m "feat: add Lens View for cross-source signal comparison"
```

---

### Task 18: Red Team Mode

**Files:**
- Create: `src/lib/redteam/scenarios.json`
- Create: `src/lib/redteam/stress-test.ts`
- Create: `src/app/api/redteam/route.ts`
- Create: `src/app/redteam/page.tsx`
- Create: `src/app/components/StressTest.tsx`
- Create: `src/app/components/ShockBuilder.tsx`

- [ ] **Step 1: Create scenarios.json**

```json
[
  { "id": "btc-crash", "name": "Black Swan: Bitcoin -50%", "overrides": { "bitcoin": 0.05 } },
  { "id": "oil-shock", "name": "Oil Shock: Crude +80%", "overrides": { "oil-price": 0.95 } },
  { "id": "flash-crash", "name": "Flash Crash: S&P -15%", "overrides": { "sp500": 0.15 } },
  { "id": "fed-pivot", "name": "Fed Pivot: Rates Cut", "overrides": { "fed-rate": 0.1 } },
  { "id": "ai-crackdown", "name": "AI Regulation: Tech Crackdown", "overrides": { "ai-regulation": 0.9 } },
  { "id": "inflation-surge", "name": "Inflation Surge: CPI 8%", "overrides": { "inflation": 0.95 } }
]
```

- [ ] **Step 2: Create stress test engine**

Uses `computeFork()` from fork-engine. For each prediction, measures fragility = |delta| from a standard 10% shock. Sorts by fragility descending. Optionally calls Groq for a 2-3 sentence resilience report.

- [ ] **Step 3: Create redteam API route**

GET with `?scenario=btc-crash` or `?overrides={"bitcoin":0.05}`. Returns fork results + fragility rankings + optional LLM report.

- [ ] **Step 4: Create StressTest component**

Dashboard showing: scenario name, table of predictions ranked by fragility (most fragile first), color-coded bars, LLM resilience report if available.

- [ ] **Step 5: Create ShockBuilder component**

Form with prediction selector + value slider for custom shock scenarios.

- [ ] **Step 6: Create redteam page**

Grid of preset scenario cards + custom builder. Click a scenario to see StressTest results. Wrapped in AppShell.

- [ ] **Step 7: Verify build and commit**

```bash
npm run build
git add src/lib/redteam/ src/app/api/redteam/ src/app/redteam/ src/app/components/StressTest.tsx src/app/components/ShockBuilder.tsx
git commit -m "feat: add Red Team Mode with stress testing and resilience reports"
```

---

### Task 19: Living Document Mode

**Files:**
- Create: `src/lib/sources/change-detector.ts`
- Create: `src/app/api/sources/route.ts`
- Create: `src/app/api/cron/check-sources/route.ts`
- Create: `src/app/api/cron/prune/route.ts`
- Create: `src/app/components/WatchSources.tsx`

- [ ] **Step 1: Create change detector**

```typescript
// src/lib/sources/change-detector.ts
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
```

- [ ] **Step 2: Create sources CRUD API**

GET (list user's sources), POST (add source), DELETE (remove source). All validate `X-User-Id`.

- [ ] **Step 3: Create check-sources cron**

Fetches all watched_sources, batches through change detector, updates last_hash and last_checked. Increments fail_count on errors, disables after 5 failures.

- [ ] **Step 4: Create prune cron**

Weekly maintenance: delete user_predictions > 90 days, replay_commentary > 30 days, old signals > 14 days.

- [ ] **Step 5: Create WatchSources component**

Panel that shows user's watched sources for a prediction. Add form (URL input + type selector). Remove button per source. Error state display. Used inside prediction detail views.

- [ ] **Step 6: Verify build and commit**

```bash
npm run build
git add src/lib/sources/ src/app/api/sources/ src/app/api/cron/check-sources/ src/app/api/cron/prune/ src/app/components/WatchSources.tsx
git commit -m "feat: add Living Document Mode with source watching and data pruning"
```

---

### Task 20: Final integration and polish

**Files:**
- Modify: `src/app/components/DomainNav.tsx` — final nav update
- Modify: `src/app/profile/page.tsx` — show tournament rank
- Modify: `src/app/components/GenericPredictionCard.tsx` — final button integration

- [ ] **Step 1: Finalize DomainNav with all links**

Ensure DomainNav includes: Feed, Economy, Tech, Politics, Tournaments, Leaderboard, Heatmap, Agents, Red Team, Lens. Consider grouping into primary (Feed, domains) and secondary (features) sections if too many links.

- [ ] **Step 2: Update profile page**

Remove OracleScore references. Show: user's leaderboard position, Brier score, rank title, total predictions, active tournament count. Add Export/Import ID section.

- [ ] **Step 3: Final GenericPredictionCard**

Ensure it has three action links: "Predict" (opens inline slider or links to tournament), "What if?" (links to fork), "Replay" (links to replay). Keep them subtle — small text links below the card content.

- [ ] **Step 4: Full build verification**

```bash
npm run build
```

Fix any remaining issues.

- [ ] **Step 5: Push to GitHub and deploy**

```bash
git add -A
git commit -m "feat: complete Sibyl Oracle V2 — all 8 features integrated"
git push origin main
```

Vercel auto-deploys from push. Add `GROQ_API_KEY` to Vercel environment variables.

- [ ] **Step 6: Run migration in production Supabase**

Copy contents of `supabase/migrations/003_v2_features.sql` and run in Supabase SQL Editor.

- [ ] **Step 7: Set up cron jobs on cron-job.org**

Add new cron endpoints:
- `/api/cron/resolve-tournaments` — daily
- `/api/cron/check-sources` — every 2 hours
- `/api/cron/prune` — weekly

All with `Authorization: Bearer {CRON_SECRET}` header.
