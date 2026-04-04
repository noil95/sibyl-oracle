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
