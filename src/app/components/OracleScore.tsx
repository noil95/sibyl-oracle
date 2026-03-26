"use client";

import { useEffect, useState } from "react";
import { getOracleState, recordDailyVisit, getScoreLevel, type OracleState } from "@/lib/gamification/oracle-score";
import { BADGES, RARITY_COLORS, type BadgeDefinition } from "@/lib/gamification/badges";

export default function OracleScore() {
  const [state, setState] = useState<OracleState | null>(null);

  useEffect(() => {
    const updated = recordDailyVisit();
    setState(updated);
  }, []);

  if (!state) return null;

  const level = getScoreLevel(state.score);
  const progress = level.next > 0 ? (state.score / level.next) * 100 : 100;
  const earnedBadges = state.badges
    .map((id) => BADGES[id])
    .filter((b): b is BadgeDefinition => !!b);

  return (
    <div className="space-y-6">
      {/* Score display */}
      <div className="text-center space-y-3">
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="var(--border-primary)"
              strokeWidth="4"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="var(--accent-purple)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - Math.min(progress, 100) / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-[var(--text-primary)] score-animate tabular-nums">{state.score}</span>
            <span className="text-[10px] text-[var(--text-label)]">/ 1000</span>
          </div>
        </div>

        <div>
          <span className={`text-sm font-semibold ${level.color}`}>{level.level}</span>
          <p className="text-[10px] text-[var(--text-label)] mt-0.5">
            {level.next - state.score} points to next level
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: state.streak, label: "Day Streak" },
          { value: earnedBadges.length, label: "Badges" },
          { value: state.predictionsViewed, label: "Viewed" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{stat.value}</div>
            <div className="text-[10px] text-[var(--text-label)] uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-wider text-[var(--text-label)] font-semibold">Badges</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(BADGES).map((badge) => {
            const earned = state.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors ${
                  earned
                    ? RARITY_COLORS[badge.rarity]
                    : "border-[var(--border-primary)] bg-[var(--bg-card)] opacity-40"
                }`}
              >
                <span className="text-lg">{badge.icon}</span>
                <div className="min-w-0">
                  <div className={`text-xs font-semibold truncate ${earned ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
                    {badge.name}
                  </div>
                  <div className="text-[10px] text-[var(--text-label)] truncate">{badge.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
