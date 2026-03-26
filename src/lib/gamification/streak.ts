// Streak tracking — consecutive days visiting Sibyl Oracle
// Stored in localStorage for MVP (no auth needed)

const STREAK_KEY = "sibyl-oracle-streak";
const LAST_VISIT_KEY = "sibyl-oracle-last-visit";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string; // YYYY-MM-DD
  totalVisits: number;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

/**
 * Get current streak data from localStorage.
 */
export function getStreakData(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, longestStreak: 0, lastVisitDate: "", totalVisits: 0 };
  }

  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Corrupted data, reset
  }

  return { currentStreak: 0, longestStreak: 0, lastVisitDate: "", totalVisits: 0 };
}

/**
 * Record a visit and update the streak.
 * Call this once per page load (e.g., in a useEffect on the homepage).
 * Returns the updated streak data and points earned.
 */
export function recordVisit(): { streakData: StreakData; pointsEarned: number } {
  const data = getStreakData();
  const today = getToday();
  const yesterday = getYesterday();

  let pointsEarned = 0;

  // Already visited today — no change
  if (data.lastVisitDate === today) {
    return { streakData: data, pointsEarned: 0 };
  }

  // Visited yesterday — streak continues
  if (data.lastVisitDate === yesterday) {
    data.currentStreak += 1;
    pointsEarned = 10 + Math.min(data.currentStreak * 2, 20); // 10-30 points, scaling with streak
  }
  // First visit or streak broken
  else {
    data.currentStreak = 1;
    pointsEarned = 10; // Base visit points
  }

  // Update longest streak
  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }

  data.lastVisitDate = today;
  data.totalVisits += 1;

  // Streak milestone bonuses
  if (data.currentStreak === 7) pointsEarned += 50;   // 1 week
  if (data.currentStreak === 30) pointsEarned += 200;  // 1 month
  if (data.currentStreak === 100) pointsEarned += 500; // 100 days

  // Save
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(data));
      localStorage.setItem(LAST_VISIT_KEY, today);
    } catch {
      // localStorage full or unavailable
    }
  }

  return { streakData: data, pointsEarned };
}

/**
 * Get streak status text for display.
 */
export function getStreakStatus(streak: number): string {
  if (streak === 0) return "Start your streak!";
  if (streak === 1) return "Day 1 — keep it going!";
  if (streak < 7) return `${streak} days — building momentum`;
  if (streak < 30) return `${streak} days — on fire!`;
  if (streak < 100) return `${streak} days — legendary`;
  return `${streak} days — Oracle Master`;
}

/**
 * Get streak emoji for display.
 */
export function getStreakEmoji(streak: number): string {
  if (streak === 0) return "";
  if (streak < 3) return "";
  if (streak < 7) return "";
  if (streak < 30) return "";
  return "";
}

/**
 * Reset streak data (for testing/debugging).
 */
export function resetStreak(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STREAK_KEY);
    localStorage.removeItem(LAST_VISIT_KEY);
  }
}
