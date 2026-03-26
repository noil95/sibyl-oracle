-- =====================================================
-- Migration 002: Multi-Domain Predictions + User Profiles
-- =====================================================

-- Generalized prediction types (supports political, economic, tech domains)
CREATE TABLE prediction_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL CHECK (domain IN ('political', 'economic', 'tech')),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  data_sources JSONB DEFAULT '[]',
  weights JSONB DEFAULT '{}',
  refresh_tier TEXT NOT NULL DEFAULT 'warm' CHECK (refresh_tier IN ('hot', 'warm', 'cold')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles (works without auth, optional account)
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT,
  industry TEXT,
  job_role TEXT,
  city TEXT,
  housing TEXT CHECK (housing IN ('owner', 'renter', NULL)),
  stocks TEXT[] DEFAULT '{}',
  crypto TEXT[] DEFAULT '{}',
  oracle_score INT DEFAULT 0,
  badges JSONB DEFAULT '[]',
  streak INT DEFAULT 0,
  last_visit DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Extend signals table to support prediction_type_id (nullable for backward compat)
ALTER TABLE signals ADD COLUMN prediction_type_id UUID REFERENCES prediction_types(id) ON DELETE CASCADE;
ALTER TABLE signals ALTER COLUMN candidate_id DROP NOT NULL;

-- Extend predictions table to support prediction_type_id
ALTER TABLE predictions ADD COLUMN prediction_type_id UUID REFERENCES prediction_types(id) ON DELETE CASCADE;
ALTER TABLE predictions ALTER COLUMN candidate_id DROP NOT NULL;

-- Add a score column for non-political predictions (directional: 0-1 where >0.5 = up, <0.5 = down)
ALTER TABLE predictions ADD COLUMN score FLOAT;
ALTER TABLE predictions ADD COLUMN direction TEXT CHECK (direction IN ('up', 'down', 'stable', NULL));

-- Indexes for multi-domain queries
CREATE INDEX idx_prediction_types_domain ON prediction_types(domain);
CREATE INDEX idx_signals_prediction_type ON signals(prediction_type_id, fetched_at DESC);
CREATE INDEX idx_predictions_prediction_type ON predictions(prediction_type_id, computed_at DESC);

-- Enable realtime for prediction_types
ALTER PUBLICATION supabase_realtime ADD TABLE prediction_types;

-- =====================================================
-- Seed: Economic Domain (10 predictions)
-- =====================================================
INSERT INTO prediction_types (domain, slug, name, description, data_sources, weights, refresh_tier) VALUES
('economic', 'fed-rate', 'Fed Interest Rate Direction', 'Will the Federal Reserve raise, hold, or cut interest rates?',
  '[{"api": "fred", "series": "DFF"}]',
  '{"data_trend": 0.60, "news_sentiment": 0.25, "reddit_momentum": 0.15}',
  'cold'),

('economic', 'unemployment', 'US Unemployment Trend', 'Is US unemployment rising or falling?',
  '[{"api": "bls", "series": "LNS14000000"}]',
  '{"data_trend": 0.65, "news_sentiment": 0.20, "reddit_momentum": 0.15}',
  'cold'),

('economic', 'sp500-direction', 'S&P 500 Monthly Direction', 'Will the S&P 500 go up or down this month?',
  '[{"api": "yahoo", "symbol": "^GSPC"}]',
  '{"data_trend": 0.50, "news_sentiment": 0.30, "reddit_momentum": 0.20}',
  'warm'),

('economic', 'bitcoin-direction', 'Bitcoin Price Direction', 'Will Bitcoin go up or down?',
  '[{"api": "coingecko", "coin": "bitcoin"}]',
  '{"data_trend": 0.40, "news_sentiment": 0.30, "reddit_momentum": 0.30}',
  'hot'),

('economic', 'gdp-growth', 'US GDP Growth Trend', 'Is US GDP growth accelerating or slowing?',
  '[{"api": "fred", "series": "GDP"}]',
  '{"data_trend": 0.70, "news_sentiment": 0.20, "reddit_momentum": 0.10}',
  'cold'),

('economic', 'oil-price', 'Oil Price Direction', 'Will crude oil prices rise or fall?',
  '[{"api": "eia", "series": "PET.RWTC.D"}]',
  '{"data_trend": 0.50, "news_sentiment": 0.30, "reddit_momentum": 0.20}',
  'warm'),

('economic', 'inflation-cpi', 'US Inflation Trend (CPI)', 'Is inflation rising or falling?',
  '[{"api": "fred", "series": "CPIAUCSL"}]',
  '{"data_trend": 0.65, "news_sentiment": 0.25, "reddit_momentum": 0.10}',
  'cold'),

('economic', 'housing-market', 'Housing Market Direction', 'Are US home prices going up or down?',
  '[{"api": "fred", "series": "MSPUS"}]',
  '{"data_trend": 0.60, "news_sentiment": 0.25, "reddit_momentum": 0.15}',
  'cold'),

('economic', 'dollar-strength', 'US Dollar Strength (DXY)', 'Is the US dollar getting stronger or weaker?',
  '[{"api": "yahoo", "symbol": "DX-Y.NYB"}]',
  '{"data_trend": 0.55, "news_sentiment": 0.30, "reddit_momentum": 0.15}',
  'warm'),

('economic', 'gold-price', 'Gold Price Direction', 'Will gold prices rise or fall?',
  '[{"api": "yahoo", "symbol": "GC=F"}]',
  '{"data_trend": 0.50, "news_sentiment": 0.30, "reddit_momentum": 0.20}',
  'warm');

-- =====================================================
-- Seed: Tech Domain (10 predictions)
-- =====================================================
INSERT INTO prediction_types (domain, slug, name, description, data_sources, weights, refresh_tier) VALUES
('tech', 'ai-regulation', 'AI Regulation Likelihood', 'How likely is major AI regulation in the US?',
  '[{"api": "newsapi", "query": "AI regulation legislation"}, {"api": "reddit", "subreddit": "artificial"}]',
  '{"news_sentiment": 0.45, "reddit_momentum": 0.35, "data_trend": 0.20}',
  'warm'),

('tech', 'tech-layoffs', 'Next Major Tech Layoff Wave', 'Are more big tech layoffs coming?',
  '[{"api": "newsapi", "query": "tech layoffs"}, {"api": "reddit", "subreddit": "cscareerquestions"}]',
  '{"news_sentiment": 0.45, "reddit_momentum": 0.35, "data_trend": 0.20}',
  'warm'),

('tech', 'crypto-regulation', 'Crypto Regulation Crackdown', 'Will there be a major crypto regulatory crackdown?',
  '[{"api": "newsapi", "query": "cryptocurrency regulation SEC"}, {"api": "reddit", "subreddit": "cryptocurrency"}]',
  '{"news_sentiment": 0.45, "reddit_momentum": 0.35, "data_trend": 0.20}',
  'warm'),

('tech', 'tiktok-ban', 'TikTok US Ban Outcome', 'Will TikTok be banned or forced to sell in the US?',
  '[{"api": "newsapi", "query": "TikTok ban US"}, {"api": "reddit", "subreddit": "technology"}]',
  '{"news_sentiment": 0.50, "reddit_momentum": 0.30, "data_trend": 0.20}',
  'cold'),

('tech', 'apple-stock', 'Apple Stock Direction', 'Will Apple stock go up or down?',
  '[{"api": "yahoo", "symbol": "AAPL"}]',
  '{"data_trend": 0.50, "news_sentiment": 0.30, "reddit_momentum": 0.20}',
  'hot'),

('tech', 'tesla-stock', 'Tesla Stock Direction', 'Will Tesla stock go up or down?',
  '[{"api": "yahoo", "symbol": "TSLA"}]',
  '{"data_trend": 0.45, "news_sentiment": 0.30, "reddit_momentum": 0.25}',
  'hot'),

('tech', 'nvidia-stock', 'NVIDIA Stock Direction', 'Will NVIDIA stock go up or down?',
  '[{"api": "yahoo", "symbol": "NVDA"}]',
  '{"data_trend": 0.45, "news_sentiment": 0.30, "reddit_momentum": 0.25}',
  'hot'),

('tech', 'remote-work', 'Remote Work Trend', 'Is remote work expanding or contracting?',
  '[{"api": "newsapi", "query": "remote work return office"}, {"api": "reddit", "subreddit": "remotework"}]',
  '{"news_sentiment": 0.40, "reddit_momentum": 0.40, "data_trend": 0.20}',
  'cold'),

('tech', 'data-breach', 'Next Major Data Breach', 'How likely is a major data breach in the next 30 days?',
  '[{"api": "newsapi", "query": "data breach cybersecurity hack"}, {"api": "reddit", "subreddit": "cybersecurity"}]',
  '{"news_sentiment": 0.50, "reddit_momentum": 0.30, "data_trend": 0.20}',
  'cold'),

('tech', 'ethereum-direction', 'Ethereum Price Direction', 'Will Ethereum go up or down?',
  '[{"api": "coingecko", "coin": "ethereum"}]',
  '{"data_trend": 0.40, "news_sentiment": 0.30, "reddit_momentum": 0.30}',
  'hot');
