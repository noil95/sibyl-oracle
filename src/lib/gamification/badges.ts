// Badge definitions for the Oracle Score system

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const BADGES: Record<string, BadgeDefinition> = {
  "first-prediction": {
    id: "first-prediction",
    name: "First Glimpse",
    description: "Viewed your first prediction",
    icon: "👁",
    rarity: "common",
  },
  "all-domains": {
    id: "all-domains",
    name: "Worldview",
    description: "Explored all prediction domains",
    icon: "🌍",
    rarity: "rare",
  },
  "7-day-streak": {
    id: "7-day-streak",
    name: "Consistent",
    description: "7-day visit streak",
    icon: "🔥",
    rarity: "rare",
  },
  "30-day-streak": {
    id: "30-day-streak",
    name: "Devoted",
    description: "30-day visit streak",
    icon: "⚡",
    rarity: "epic",
  },
  "data-junkie": {
    id: "data-junkie",
    name: "Data Junkie",
    description: "Viewed 50+ predictions",
    icon: "📊",
    rarity: "rare",
  },
  "profile-complete": {
    id: "profile-complete",
    name: "Identity",
    description: "Completed your profile",
    icon: "🎭",
    rarity: "common",
  },
};

export const RARITY_COLORS = {
  common: "border-white/20 bg-white/5",
  rare: "border-blue-500/30 bg-blue-500/5",
  epic: "border-purple-500/30 bg-purple-500/5",
  legendary: "border-amber-500/30 bg-amber-500/5",
};

export function getBadge(id: string): BadgeDefinition | undefined {
  return BADGES[id];
}
