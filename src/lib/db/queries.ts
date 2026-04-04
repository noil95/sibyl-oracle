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
    .order("fetched_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}
