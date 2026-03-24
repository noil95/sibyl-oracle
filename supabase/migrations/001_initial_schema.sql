-- Elections table
CREATE TABLE elections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Candidates table
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  party TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Raw incoming signals
CREATE TABLE signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  raw_value FLOAT NOT NULL,
  weight FLOAT NOT NULL DEFAULT 1.0,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Computed prediction scores
CREATE TABLE predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  win_probability FLOAT NOT NULL,
  confidence FLOAT NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_signals_candidate_fetched ON signals(candidate_id, fetched_at DESC);
CREATE INDEX idx_predictions_candidate_computed ON predictions(candidate_id, computed_at DESC);

-- Enable realtime for predictions table
ALTER PUBLICATION supabase_realtime ADD TABLE predictions;

-- Seed: 2026 US Senate Race — Pennsylvania (competitive swing state)
INSERT INTO elections (id, name, date, status)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026 Pennsylvania Senate Race', '2026-11-03', 'active');

INSERT INTO candidates (id, election_id, name, party)
VALUES
  ('c00d0001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'John Fetterman', 'Democrat'),
  ('c00d0002-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dave McCormick', 'Republican');
