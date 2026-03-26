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

// ── Multi-Domain Prediction Type queries ──

export async function getPredictionTypes(domain?: string) {
  let query = supabaseAdmin
    .from("prediction_types")
    .select("*")
    .eq("status", "active");

  if (domain) {
    query = query.eq("domain", domain);
  }

  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getPredictionTypeBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("prediction_types")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

export async function insertDomainSignal(signal: {
  prediction_type_id: string;
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

export async function getRecentDomainSignals(
  predictionTypeId: string,
  hoursBack = 48
) {
  const since = new Date(
    Date.now() - hoursBack * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabaseAdmin
    .from("signals")
    .select("*")
    .eq("prediction_type_id", predictionTypeId)
    .gte("fetched_at", since)
    .order("fetched_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function insertDomainPrediction(prediction: {
  prediction_type_id: string;
  win_probability: number;
  confidence: number;
  score?: number;
  direction?: string;
}) {
  const { error } = await supabaseAdmin.from("predictions").insert({
    ...prediction,
    computed_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function getLatestDomainPredictions(domain: string) {
  const predTypes = await getPredictionTypes(domain);

  if (!predTypes || predTypes.length === 0) return [];

  const results = [];
  for (const pt of predTypes) {
    const { data, error } = await supabaseAdmin
      .from("predictions")
      .select("*")
      .eq("prediction_type_id", pt.id)
      .order("computed_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    results.push({
      predictionType: pt,
      prediction: data?.[0] ?? null,
    });
  }

  return results;
}

export async function getDomainPredictionHistory(
  predictionTypeId: string,
  limit = 100
) {
  const { data, error } = await supabaseAdmin
    .from("predictions")
    .select("win_probability, confidence, score, direction, computed_at")
    .eq("prediction_type_id", predictionTypeId)
    .order("computed_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ── User Profile queries ──

export async function getOrCreateProfile(profileId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (error && error.code === "PGRST116") {
    // Not found, create new
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from("user_profiles")
      .insert({ id: profileId })
      .select()
      .single();

    if (insertError) throw insertError;
    return newProfile;
  }

  if (error) throw error;
  return data;
}

export async function updateProfile(
  profileId: string,
  updates: {
    display_name?: string;
    industry?: string;
    job_role?: string;
    city?: string;
    housing?: string;
    stocks?: string[];
    crypto?: string[];
    oracle_score?: number;
    badges?: unknown[];
    streak?: number;
    last_visit?: string;
  }
) {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .update(updates)
    .eq("id", profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
