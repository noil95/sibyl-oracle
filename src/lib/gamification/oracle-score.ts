// Oracle Score system — 0 to 1000 points
// All stored in localStorage for MVP (no auth needed)

const STORAGE_KEY = "sibyl-oracle-score";

export interface OracleState {
  score: number;
  badges: string[];
  streak: number;
  lastVisit: string | null;
  domainsVisited: string[];
  predictionsViewed: number;
  profileComplete: boolean;
}

const DEFAULT_STATE: OracleState = {
  score: 0,
  badges: [],
  streak: 0,
  lastVisit: null,
  domainsVisited: [],
  predictionsViewed: 0,
  profileComplete: false,
};

export function getOracleState(): OracleState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveOracleState(state: OracleState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── Scoring Events ──

const POINTS = {
  DAILY_VISIT: 10,
  STREAK_BONUS: 5, // per streak day
  DOMAIN_EXPLORED: 25,
  PREDICTION_VIEWED: 2,
  PROFILE_COMPLETE: 100,
  BADGE_EARNED: 50,
};

export function recordDailyVisit(): OracleState {
  const state = getOracleState();
  const today = new Date().toISOString().split("T")[0];

  if (state.lastVisit === today) return state; // Already visited today

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const isConsecutive = state.lastVisit === yesterday;

  state.streak = isConsecutive ? state.streak + 1 : 1;
  state.score += POINTS.DAILY_VISIT + (state.streak * POINTS.STREAK_BONUS);
  state.lastVisit = today;

  // Check streak badges
  if (state.streak >= 7 && !state.badges.includes("7-day-streak")) {
    state.badges.push("7-day-streak");
    state.score += POINTS.BADGE_EARNED;
  }
  if (state.streak >= 30 && !state.badges.includes("30-day-streak")) {
    state.badges.push("30-day-streak");
    state.score += POINTS.BADGE_EARNED;
  }

  // Cap at 1000
  state.score = Math.min(1000, state.score);
  saveOracleState(state);
  return state;
}

export function recordDomainVisit(domain: string): OracleState {
  const state = getOracleState();

  if (!state.domainsVisited.includes(domain)) {
    state.domainsVisited.push(domain);
    state.score += POINTS.DOMAIN_EXPLORED;

    // Check all-domains badge
    const allDomains = ["politics", "economic", "tech", "globe"];
    const hasAll = allDomains.every((d) => state.domainsVisited.includes(d));
    if (hasAll && !state.badges.includes("all-domains")) {
      state.badges.push("all-domains");
      state.score += POINTS.BADGE_EARNED;
    }
  }

  state.score = Math.min(1000, state.score);
  saveOracleState(state);
  return state;
}

export function recordPredictionView(): OracleState {
  const state = getOracleState();
  state.predictionsViewed += 1;
  state.score += POINTS.PREDICTION_VIEWED;

  if (state.predictionsViewed >= 1 && !state.badges.includes("first-prediction")) {
    state.badges.push("first-prediction");
    state.score += POINTS.BADGE_EARNED;
  }
  if (state.predictionsViewed >= 50 && !state.badges.includes("data-junkie")) {
    state.badges.push("data-junkie");
    state.score += POINTS.BADGE_EARNED;
  }

  state.score = Math.min(1000, state.score);
  saveOracleState(state);
  return state;
}

export function recordProfileComplete(): OracleState {
  const state = getOracleState();
  if (!state.profileComplete) {
    state.profileComplete = true;
    state.score += POINTS.PROFILE_COMPLETE;
    if (!state.badges.includes("profile-complete")) {
      state.badges.push("profile-complete");
      state.score += POINTS.BADGE_EARNED;
    }
  }
  state.score = Math.min(1000, state.score);
  saveOracleState(state);
  return state;
}

// ── Score Level ──

export function getScoreLevel(score: number): {
  level: string;
  color: string;
  next: number;
} {
  if (score >= 900) return { level: "Oracle", color: "text-amber-400", next: 1000 };
  if (score >= 700) return { level: "Seer", color: "text-purple-400", next: 900 };
  if (score >= 500) return { level: "Prophet", color: "text-blue-400", next: 700 };
  if (score >= 300) return { level: "Analyst", color: "text-cyan-400", next: 500 };
  if (score >= 100) return { level: "Observer", color: "text-green-400", next: 300 };
  return { level: "Novice", color: "text-white/50", next: 100 };
}
