# Sibyl Oracle V2 — Platform Transformation Design

## Overview

Transform Sibyl Oracle from a passive prediction display into an interactive prediction intelligence platform. Add 8 new features inspired by social simulation platforms, cut dead-weight features, and integrate a free LLM (Groq/Llama 3) for dynamic AI interactions.

## Constraints

- $0/month budget — all free tier APIs and services
- Free LLM: Groq (Llama 3) for AI text generation — generous free tier
- Existing stack: Next.js 16, Supabase, Tailwind CSS, Vercel
- Existing data pipeline: FRED, BLS, Yahoo Finance, CoinGecko, EIA, NewsAPI, Reddit

## User Identity

Users are identified by a client-generated UUID v4 stored in localStorage under `sibyl-user-id`. On first visit, the app generates and persists this ID. All API calls include it as a header (`X-User-Id`).

**If localStorage is cleared:** The user loses their tournament history, leaderboard rank, and agent chat history. The profile page shows a warning: "Your identity is stored locally. Export your ID to recover it on another device." A small "Export/Import ID" feature lets users copy/paste their UUID.

**Security:** Since user_id is self-reported, all API routes validate format (must be valid UUID v4) but cannot prevent impersonation. This is acceptable for a free, anonymous prediction platform. No financial transactions depend on identity.

## Existing Table Schemas (for reference)

The following tables already exist and are used by new features:

```sql
-- signals table (used by Feature F: Lens View)
-- Stores per-source signal data from cron refreshes
signals (
  id uuid PRIMARY KEY,
  candidate_id uuid REFERENCES candidates,
  prediction_type_id uuid REFERENCES prediction_types,
  source text NOT NULL,              -- 'newsapi'|'reddit'|'polling'|'fred'|'yahoo'|'coingecko'|'bls'|'eia'
  score float NOT NULL,              -- 0.0 to 1.0
  raw_data jsonb,                    -- source-specific payload
  created_at timestamptz DEFAULT now()
)

-- predictions table (used by Feature G: Replay)
-- Stores timestamped probability snapshots
predictions (
  id uuid PRIMARY KEY,
  candidate_id uuid REFERENCES candidates,
  prediction_type_id uuid REFERENCES prediction_types,
  probability float NOT NULL,
  confidence float,
  direction text,                    -- 'up'|'down'|'stable'
  created_at timestamptz DEFAULT now()
)
```

Note: For replay commentary (Feature G), `signal_snapshot` in `replay_commentary` is built by querying the `signals` table for all signals within the same refresh window as the prediction timestamp.

## Shared Database Tables

These tables are used across multiple features:

```sql
-- Defines causal relationships between predictions (used by Features A, B, C)
prediction_relationships (
  id uuid PRIMARY KEY,
  source_slug text NOT NULL,
  target_slug text NOT NULL,
  multiplier float NOT NULL,          -- how much source affects target (-1 to 1)
  lag_description text,               -- 'within days'|'within weeks'|'within months'
  UNIQUE(source_slug, target_slug)
)
```

Seeded with ~30 relationships covering all 20+ predictions.

## Data Retention & Pruning

Supabase free tier: 500MB, ~50K rows. To stay within limits:

- **user_predictions:** Keep last 90 days. Cron job deletes resolved tournament predictions older than 90 days (weekly).
- **replay_commentary:** Keep last 30 days of commentary. Older entries pruned weekly.
- **signals:** Keep last 14 days of raw signals. Older signals pruned daily by existing cron.
- **watched_sources:** Hard cap at 100 total (not 500). Max 5 per user.
- **predictions:** Keep last 60 days. Aggregate older data into weekly summaries.

A maintenance cron (`/api/cron/prune`) runs weekly to enforce these limits.

## Groq LLM: Rate Budget & Failure Handling

**Rate budget allocation (30 req/min, 14,400 req/day):**
- Agent Chat (Feature D): 15 req/min max (50% of budget)
- Replay Commentary (Feature G): 5 req/min max (generated lazily, cached)
- Red Team Reports (Feature B): 5 req/min max (one report per stress test)
- Buffer: 5 req/min reserved

**Server-side rate limiter:** A simple in-memory counter per feature resets every 60 seconds. If a feature exceeds its budget, requests are queued or rejected with a user-friendly message.

**Failure handling (all features using Groq):**
- **429 (rate limited):** Return cached response if available. Otherwise show "AI analysis is temporarily busy. Try again in a moment." No retry loop.
- **503 (service down):** Show "AI commentary unavailable" with the raw data still visible. Features degrade gracefully — users still see predictions, forks, and data, just without LLM narration.
- **Malformed response:** Validate LLM output is non-empty and <500 words. If invalid, discard and show "Commentary could not be generated."
- **Daily quota exhausted:** Show "AI features are resting for today. Data and predictions remain fully available."

---

## What Gets Cut

| Feature | Files to Remove | Reason |
|---------|----------------|--------|
| Globe page | `src/app/globe/page.tsx`, `src/app/components/GlobeView.tsx`, `src/app/components/MiniGlobe.tsx` | Hardcoded hotspots, no real data integration. Contagion Heatmap replaces it. |
| Oracle Score gamification | `src/lib/gamification/oracle-score.ts`, `src/lib/gamification/badges.ts`, `src/lib/gamification/streak.ts`, `src/app/components/OracleScore.tsx` | Hollow visit-based points. Calibration Tournaments replace with skill-based ranking. |
| Static impact templates | `src/lib/impact/templates.ts`, `src/lib/impact/data/impact-map.json`, `src/app/api/impact/route.ts`, `src/app/components/ImpactPanel.tsx` | Static text templates. Agent Interrogation Room provides dynamic AI analysis. |
| Static ripple chains JSON | `src/lib/ripple/data/ripple-chains.json` | Replaced by dynamic fork engine that generates chains from live data. |

**What stays:**
- Data pipeline (all 8 ingestion modules)
- Ripple Engine core logic (`engine.ts`, `personal-impact.ts`) — backbone of Fork Explorer
- Supabase database layer
- AppShell, DomainNav, PredictionFeed, GenericPredictionCard
- All cron refresh routes
- Profile page and ProfileEditor (user preferences feed into personalization)

---

## Feature Specifications

### Feature E: Calibration Tournaments

**Purpose:** Give users skin in the game. They predict outcomes before seeing AI predictions, get scored on accuracy, compete on leaderboards.

**New database tables:**

```sql
-- Active prediction markets users can bet on
tournaments (
  id uuid PRIMARY KEY,
  prediction_slug text NOT NULL,       -- links to prediction_types
  title text NOT NULL,                  -- "Will the Fed raise rates in April?"
  description text,
  closes_at timestamptz NOT NULL,       -- when betting closes
  resolves_at timestamptz,              -- when outcome is known
  resolution text,                      -- 'yes'|'no'|'up'|'down'|'stable'|null
  status text DEFAULT 'open',           -- 'open'|'closed'|'resolved'
  created_at timestamptz DEFAULT now()
)

-- Individual user predictions
user_predictions (
  id uuid PRIMARY KEY,
  tournament_id uuid REFERENCES tournaments,
  user_id text NOT NULL,                -- localStorage-based user ID
  predicted_probability float NOT NULL, -- 0.0 to 1.0
  predicted_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, user_id)
)

-- Aggregated user scores
leaderboard (
  user_id text PRIMARY KEY,
  display_name text,
  total_predictions int DEFAULT 0,
  total_brier_sum float DEFAULT 0,      -- sum of all individual Brier scores
  total_resolved int DEFAULT 0,         -- number of resolved predictions
  rank_title text DEFAULT 'Novice',     -- Novice|Analyst|Strategist|Oracle
  streak int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
)
```

**Scoring:** Brier score = (predicted_probability - actual_outcome)^2. Lower is better. The leaderboard stores `total_brier_sum` and `total_resolved` separately; displayed score = total_brier_sum / total_resolved. When a tournament resolves: `total_brier_sum += individual_brier`, `total_resolved += 1`.

**Duplicate predictions:** Unique constraint on `(tournament_id, user_id)`. If a user re-submits, their prediction is updated (overwritten), not duplicated. Only the latest prediction before `closes_at` counts.

**Tournament resolution:** Semi-automatic. A cron job (`/api/cron/resolve-tournaments`) runs daily, checks tournaments past `resolves_at`, and auto-resolves by comparing the prediction_type's current value against the tournament's target. Admin can also manually resolve via the API with a `CRON_SECRET` header. If `resolves_at` passes but data is inconclusive, status stays `closed` (not `resolved`) until manually resolved or data becomes available.

**Input validation:** Server-side: `predicted_probability` must be a number between 0.0 and 1.0 inclusive. `tournament_id` must exist and have status `open`. `closes_at` must be in the future. Invalid requests return 400.

**Rank titles:** Novice (0-9 predictions), Analyst (10-49), Strategist (50-99), Oracle (100+, top 10% Brier score).

**New files:**
- `src/app/tournaments/page.tsx` — lists open tournaments with countdown timers
- `src/app/tournaments/[id]/page.tsx` — individual tournament: slider, submit, see others' aggregate
- `src/app/leaderboard/page.tsx` — ranked list of forecasters
- `src/app/api/tournaments/route.ts` — CRUD for tournaments
- `src/app/api/tournaments/predict/route.ts` — submit a prediction
- `src/app/api/tournaments/resolve/route.ts` — resolve a tournament, calculate scores
- `src/lib/scoring/brier.ts` — Brier score calculation
- `src/app/components/TournamentCard.tsx` — card showing title, closing time, participation count
- `src/app/components/PredictionSlider.tsx` — probability slider (0-100%) with submit button
- `src/app/components/LeaderboardTable.tsx` — ranked table with Brier scores

**Integration with existing:** Every GenericPredictionCard gets a small "Predict" button. Clicking it opens the PredictionSlider inline. DomainNav adds "Tournaments" and "Leaderboard" links.

---

### Feature A: Narrative Fork Explorer

**Purpose:** Users click any prediction and ask "What if?" — override a value, see cascading downstream effects via the Ripple Engine, compare two timelines side-by-side.

**How it works:**
1. User picks a prediction (e.g., "Fed Rate: 68% chance of hike")
2. Overrides the probability with a slider (e.g., sets it to 20%)
3. The ripple engine recalculates all connected predictions with the override
4. UI shows two columns: "Current reality" vs "Your scenario"
5. Multi-variable forks: user can override up to 5 predictions simultaneously (soft UX limit, not a hard technical constraint — the engine handles any number, but the UI shows max 5 override sliders to keep the interface usable)
6. Fork results are URL-encoded and shareable

**New files:**
- `src/app/fork/[slug]/page.tsx` — fork interface for a specific prediction
- `src/lib/ripple/fork-engine.ts` — extends engine.ts with `computeFork(overrides: Record<string, number>)` that takes multiple prediction slug overrides and returns the full recalculated state
- `src/app/components/ForkView.tsx` — split-screen comparison (original vs forked)
- `src/app/components/ForkSlider.tsx` — override slider per prediction
- `src/app/api/fork/route.ts` — accepts override params, returns forked prediction set

**Integration with existing:** Uses `ripple/engine.ts` core logic. Each GenericPredictionCard gets a "What if?" link. Ripple chain connections define which predictions are downstream of which.

**Dynamic chain generation:** Instead of static `ripple-chains.json`, chains are derived from the `prediction_relationships` table (defined in Shared Database Tables above). The fork engine traverses relationships recursively from the overridden prediction, applying multipliers at each hop, with max depth of 4 to prevent infinite loops. All slugs reference `prediction_types.slug`.

---

### Feature C: Contagion Heatmap

**Purpose:** Replace the Globe. A 2D network graph where all predictions are nodes, connected by their ripple relationships. Signals flow visually along edges when data refreshes.

**How it works:**
1. Nodes represent each prediction (sized by confidence, colored by domain)
2. Edges represent prediction_relationships (thickness = multiplier strength)
3. When a cron refresh updates a prediction, a pulse animation travels from that node through its edges to connected nodes
4. Users click a node to see its prediction details
5. Color coding: purple = economy, blue = tech, red = politics, gold = crypto

**New files:**
- `src/app/heatmap/page.tsx` — replaces `/globe`
- `src/app/components/ContagionGraph.tsx` — canvas/SVG-based force-directed graph
- `src/app/api/heatmap/route.ts` — returns nodes (predictions) and edges (relationships) with current scores

**Implementation:** Use `d3-force` (installed as a dependency) for force-directed layout. Nodes attract/repel based on relationship strength. Render with SVG (not canvas) for clickable nodes and CSS-animated pulses. Supabase realtime subscription triggers pulse animations when predictions update.

**Integration with existing:** Uses prediction data from `/api/predictions` and relationships from `prediction_relationships` table. DomainNav replaces "Globe" with "Heatmap".

---

### Feature G: Simulation Replay with Commentary

**Purpose:** For any prediction, replay the last 7-30 days of how it changed. A timeline scrubber shows probability shifting over time, with LLM-generated narration explaining each major shift.

**How it works:**
1. User clicks "Replay" on any prediction card
2. Sees a timeline chart (extends existing ScoreHistory) with a scrubber
3. Major inflection points are marked (>5% shift in one refresh cycle)
4. At each inflection, the free LLM generates a 1-2 sentence explanation based on the signal data that caused the shift
5. Commentary is cached in Supabase so LLM isn't called repeatedly

**New database table:**

```sql
replay_commentary (
  id uuid PRIMARY KEY,
  prediction_slug text NOT NULL,
  timestamp timestamptz NOT NULL,
  signal_snapshot jsonb NOT NULL,      -- the signals that caused the shift
  commentary text NOT NULL,            -- LLM-generated explanation
  created_at timestamptz DEFAULT now()
)
```

**New files:**
- `src/app/replay/[slug]/page.tsx` — replay view for a prediction
- `src/lib/llm/groq.ts` — Groq API client (Llama 3, free tier)
- `src/lib/replay/commentary-generator.ts` — takes signal snapshot, generates commentary prompt, calls Groq
- `src/app/components/ReplayTimeline.tsx` — timeline chart with scrubber and commentary cards
- `src/app/api/replay/[slug]/route.ts` — returns prediction history + cached commentary

**Integration with existing:** Uses `prediction_history` data from Supabase (already stored by cron jobs). Extends ScoreHistory component's charting. LLM commentary is generated lazily (on first view) and cached.

---

### Feature D: Agent Interrogation Room

**Purpose:** AI expert agents per domain that users can debate with. Each agent has a personality, bias, and access to live prediction data.

**How it works:**
1. `/agents` page shows 6 agent personas in a grid
2. User clicks an agent to enter a chat interface
3. Each message from the user is sent to Groq with: agent persona prompt + live prediction data + conversation history
4. Agent responds in character, referencing real data
5. Chat history stored in localStorage (no auth needed)

**Agent personas (JSON config):**

```json
[
  {
    "id": "marcus-bull",
    "name": "Marcus the Bull",
    "avatar": "bull",
    "domain": "economic",
    "bias": "bullish",
    "personality": "Optimistic Wall Street veteran. Always finds the upside. Backs claims with data but spins everything positive.",
    "systemPrompt": "You are Marcus, a bullish economic analyst..."
  },
  {
    "id": "dr-reeves",
    "name": "Dr. Reeves",
    "avatar": "neutral",
    "domain": "economic",
    "bias": "neutral",
    "personality": "Cold, data-only. Never speculates. Corrects emotional language. Speaks in precise percentages.",
    "systemPrompt": "You are Dr. Reeves, a neutral data scientist..."
  },
  {
    "id": "crypto-skeptic",
    "name": "CryptoSkeptic",
    "avatar": "bear",
    "domain": "tech",
    "bias": "bearish",
    "personality": "Ex-banker who thinks crypto is a bubble. Sarcastic. Challenges HODLers with historical parallels.",
    "systemPrompt": "You are CryptoSkeptic, a bearish analyst..."
  },
  {
    "id": "ada-policy",
    "name": "Ada the Policy Wonk",
    "avatar": "neutral",
    "domain": "politics",
    "bias": "neutral",
    "personality": "Former congressional staffer. Explains policy implications in plain language. Loves citing precedent.",
    "systemPrompt": "You are Ada, a policy analyst..."
  },
  {
    "id": "volt",
    "name": "Volt",
    "avatar": "bull",
    "domain": "tech",
    "bias": "bullish",
    "personality": "Silicon Valley futurist. Believes AI and crypto will change everything. Dismisses skeptics as 'not getting it'.",
    "systemPrompt": "You are Volt, a tech optimist..."
  },
  {
    "id": "cassandra",
    "name": "Cassandra",
    "avatar": "bear",
    "domain": "economic",
    "bias": "bearish",
    "personality": "Doom-and-gloom economist. Sees systemic risk everywhere. Cites 2008 parallels constantly.",
    "systemPrompt": "You are Cassandra, a bearish macro analyst..."
  }
]
```

**New files:**
- `src/app/agents/page.tsx` — agent grid
- `src/app/agents/[agentId]/page.tsx` — chat interface
- `src/app/api/agents/chat/route.ts` — proxies to Groq with agent persona + live data context
- `src/lib/agents/personas.json` — agent config
- `src/lib/agents/context-builder.ts` — builds LLM context from live predictions + user profile
- `src/app/components/AgentCard.tsx` — agent preview card with avatar, name, bias badge
- `src/app/components/AgentChat.tsx` — chat UI with message bubbles, typing indicator

**Rate limiting:** Server-side rate limiter: max 15 req/min for agent chat across all users (see Groq Rate Budget above). Per-user: max 20 messages per hour, enforced server-side by tracking user_id + timestamp in a lightweight in-memory map (resets on deploy). Cache identical queries for 5 minutes. Chat history stored in localStorage, last 20 messages per agent sent as conversation context to Groq.

**API security:** The `/api/agents/chat` route validates: `X-User-Id` header is valid UUID, message body is non-empty and <1000 characters, agentId exists in personas config. Rate limit checked before Groq call. No open proxy risk — agent system prompts and data context are server-controlled.

---

### Feature F: Cross-Platform Scenario Stitching (Lens View)

**Purpose:** Show how the same prediction looks different depending on the data source. Reddit vs NewsAPI vs FRED — side-by-side, revealing information asymmetry.

**How it works:**
1. User picks a prediction on `/lens`
2. Sees 3-4 cards side-by-side, each showing one data source's raw signal
3. Each card shows: source name, raw score (0-1), direction, key data points
4. A "consensus gap" indicator shows how much sources disagree
5. Highlights which source is the outlier

**New files:**
- `src/app/lens/page.tsx` — prediction picker + lens comparison
- `src/app/api/lens/[slug]/route.ts` — returns per-source signal breakdown (not aggregated)
- `src/app/components/LensComparison.tsx` — side-by-side source cards
- `src/app/components/SourceCard.tsx` — individual source signal display
- `src/lib/lens/disaggregator.ts` — queries signals table grouped by source, returns per-source scores

**Integration with existing:** Directly queries the `signals` table which already stores per-source data from cron refreshes. No new data collection needed — just a new way to display what's already captured.

---

### Feature B: Adversarial Red Team Mode

**Purpose:** Inject a shock event into the prediction system. See which predictions break, which hold, and what the new equilibrium looks like.

**How it works:**
1. `/redteam` page shows preset shock scenarios + custom builder
2. User selects a scenario (e.g., "Bitcoin -50%") or builds custom
3. System applies the shock as a multi-variable fork through all prediction relationships
4. Dashboard shows system-wide impact: most fragile predictions, most robust, new equilibrium
5. Free LLM generates a "resilience report" summarizing findings

**Preset scenarios:**
- "Black Swan: Bitcoin -50%"
- "Oil shock: Crude +80%"
- "Flash crash: S&P -15% in one day"
- "Fed pivot: Rates cut 100bps"
- "AI regulation: Major tech crackdown"
- "Inflation surge: CPI hits 8%"

**New files:**
- `src/app/redteam/page.tsx` — scenario selector + results dashboard
- `src/lib/redteam/scenarios.json` — preset shock configs
- `src/lib/redteam/stress-test.ts` — applies multi-variable fork, measures fragility score per prediction
- `src/app/api/redteam/route.ts` — runs stress test, returns results + LLM resilience report
- `src/app/components/StressTest.tsx` — results dashboard with fragility rankings
- `src/app/components/ShockBuilder.tsx` — custom scenario builder (select predictions, set override values)

**Integration with existing:** Uses fork-engine.ts with multiple simultaneous overrides. Fragility score = how much a prediction shifts from a 10% input shock (high shift = fragile).

---

### Feature H: Living Document Mode

**Purpose:** Users connect external data sources (RSS, URLs) that auto-trigger prediction updates when new content appears.

**How it works:**
1. On any prediction card, user clicks "Watch sources"
2. Adds an RSS feed URL or web page URL
3. A cron job checks watched URLs every 30 minutes for changes
4. When change detected, triggers a targeted refresh for linked predictions only
5. User gets a notification badge showing "3 predictions updated from your sources"

**New database table:**

```sql
watched_sources (
  id uuid PRIMARY KEY,
  user_id text NOT NULL,
  prediction_slug text NOT NULL,
  source_url text NOT NULL,
  source_type text DEFAULT 'rss',    -- 'rss'|'webpage'
  last_hash text,                     -- content hash to detect changes
  last_checked timestamptz,
  created_at timestamptz DEFAULT now()
)
```

**New files:**
- `src/app/api/sources/route.ts` — CRUD for watched sources
- `src/app/api/cron/check-sources/route.ts` — cron endpoint that checks all watched URLs
- `src/lib/sources/change-detector.ts` — fetches URL, hashes content, compares to last_hash
- `src/app/components/WatchSources.tsx` — panel on prediction cards to add/remove watched URLs

**Rate limiting:** Max 5 watched sources per user. Check interval every 2 hours (not 30 minutes). Total watched sources cap at 100 system-wide. All URLs are fetched in a single serverless function invocation (batched) to conserve Vercel's 100K/month invocation limit.

**Error handling:** Failed fetches (404, timeout, malformed RSS) increment a `fail_count` on the source. After 5 consecutive failures, the source is auto-disabled and the user sees "Source unreachable — re-enable or remove." CORS is not an issue since fetches happen server-side.

---

## New Navigation Structure

```
Home (/)              — prediction feed (stays)
Economy (/economic)   — economy predictions (stays)
Tech (/tech)          — tech predictions (stays)
Politics (/politics)  — political predictions (stays)
Tournaments (/tournaments) — NEW: active prediction markets
Leaderboard (/leaderboard) — NEW: forecaster rankings
Heatmap (/heatmap)    — NEW: replaces Globe
Agents (/agents)      — NEW: AI expert agents
Red Team (/redteam)   — NEW: stress testing
Lens (/lens)          — NEW: cross-source comparison
Profile (/profile)    — stays, but shows tournament rank instead of Oracle Score
```

Fork (`/fork/[slug]`) and Replay (`/replay/[slug]`) are accessed from prediction cards, not top-level nav.

---

## Phased Build Order

**Phase 1 — Foundation (enables everything else):**
1. Set up Groq LLM client (`src/lib/llm/groq.ts`)
2. Create `prediction_relationships` table and seed 30 relationships
3. Build Calibration Tournaments (E)
4. Cut: Globe, Oracle Score, Impact templates

**Phase 2 — Interactive Intelligence:**
5. Narrative Fork Explorer (A)
6. Contagion Heatmap (C) — replaces Globe in nav

**Phase 3 — AI Layer:**
7. Agent Interrogation Room (D)
8. Simulation Replay with Commentary (G)

**Phase 4 — Advanced:**
9. Cross-Platform Lens View (F)
10. Adversarial Red Team Mode (B)
11. Living Document Mode (H)

---

## External Dependencies

| Service | Purpose | Free Tier Limits |
|---------|---------|-----------------|
| Groq | LLM for agents, commentary, reports | ~30 req/min, 14,400 req/day |
| Supabase | Database, realtime subscriptions | 500MB, 50K rows, 2M edge invocations |
| Vercel | Hosting, serverless functions | 100GB bandwidth, 100K invocations |
| Existing APIs | FRED, BLS, Yahoo, CoinGecko, EIA, NewsAPI, Reddit | Various (already configured) |

## Supabase RLS & Security

Since users are anonymous (localStorage UUID, no Supabase Auth), RLS must be permissive but safe:

- **tournaments:** Public read. Write restricted to `CRON_SECRET`-authenticated routes only (admin creates tournaments).
- **user_predictions:** Public insert (with server-side validation). Users can only read their own predictions (filtered by user_id in API, not RLS — since no auth). Unique constraint prevents spam.
- **leaderboard:** Public read. Write restricted to tournament resolution cron only.
- **prediction_relationships:** Public read. Write restricted to admin/migration.
- **replay_commentary:** Public read. Write restricted to API routes with Groq integration.
- **watched_sources:** Filtered by user_id in API queries. Max 5 per user enforced server-side.

In practice: RLS is disabled on these tables (anon key access), and all security is enforced at the API route layer via input validation, rate limiting, and `CRON_SECRET` for admin operations.

## Database Migration Plan

**Migration file:** `supabase/migrations/003_v2_features.sql`

Creates all new tables in a single migration:
1. `prediction_relationships` (shared)
2. `tournaments`
3. `user_predictions`
4. `leaderboard`
5. `replay_commentary`
6. `watched_sources`
7. Seed `prediction_relationships` with ~30 rows
8. Add indexes: `user_predictions(tournament_id)`, `user_predictions(user_id)`, `signals(prediction_type_id, source)`, `predictions(prediction_type_id, created_at)`

**Cleanup of cut features:** The old gamification system (`oracle-score.ts`, `badges.ts`, `streak.ts`) is localStorage-only — no database tables to clean up. The `impact-map.json` is a static file — just delete it. No database migration needed for cuts.

## New Environment Variables

```
GROQ_API_KEY=<from console.groq.com>
```
