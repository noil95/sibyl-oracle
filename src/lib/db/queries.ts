import { supabaseAdmin } from "./supabase";

// ── Election queries ──

export async function getActiveElection() {
  const { data, error } = await supabaseAdmin
    .from("elections")
    .select("*")
    .eq("status", "active")
    .single();

  if (error) throw error;
  return data;
}

// ── Candidate queries ──

export async function getCandidates(electionId: string) {
  const { data, error } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .eq("election_id", electionId);

  if (error) throw error;
  return data;
}

// ── Signal queries ──

export async function insertSignal(signal: {
  candidate_id: string;
  source: string;
  raw_value: number;
  weight: number;
}) {
  const { error } = await supabaseAdmin.from("signals").insert({
    ...signal,
    fetched_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function getRecentSignals(candidateId: string, hoursBack = 24) {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("signals")
    .select("*")
    .eq("candidate_id", candidateId)
    .gte("fetched_at", since)
    .order("fetched_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ── Prediction queries ──

export async function insertPrediction(prediction: {
  candidate_id: string;
  win_probability: number;
  confidence: number;
}) {
  const { error } = await supabaseAdmin.from("predictions").insert({
    ...prediction,
    computed_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function getLatestPredictions(electionId: string) {
  const { data, error } = await supabaseAdmin
    .from("predictions")
    .select("*, candidates!inner(id, name, party, election_id)")
    .eq("candidates.election_id", electionId)
    .order("computed_at", { ascending: false });

  if (error) throw error;

  // Get only the most recent prediction per candidate
  const latest = new Map<string, typeof data[0]>();
  for (const row of data) {
    if (!latest.has(row.candidate_id)) {
      latest.set(row.candidate_id, row);
    }
  }

  return Array.from(latest.values());
}

export async function getPredictionHistory(
  candidateId: string,
  limit = 100
) {
  const { data, error } = await supabaseAdmin
    .from("predictions")
    .select("win_probability, confidence, computed_at")
    .eq("candidate_id", candidateId)
    .order("computed_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}
