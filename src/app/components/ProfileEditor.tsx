"use client";

import { useState, useEffect } from "react";
import { recordProfileComplete } from "@/lib/gamification/oracle-score";

const STORAGE_KEY = "sibyl-oracle-profile";

interface UserProfile {
  displayName: string;
  industry: string;
  jobRole: string;
  city: string;
  housing: string;
  stocks: string[];
  crypto: string[];
}

const DEFAULT_PROFILE: UserProfile = {
  displayName: "",
  industry: "",
  jobRole: "",
  city: "",
  housing: "",
  stocks: [],
  crypto: [],
};

const INDUSTRIES = [
  "Tech", "Healthcare", "Finance", "Manufacturing", "Energy",
  "Education", "Retail", "Government", "Agriculture", "Other",
];

const POPULAR_STOCKS = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META"];
const POPULAR_CRYPTO = ["BTC", "ETH", "SOL", "XRP", "ADA", "DOGE"];

function getProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

  const filled = [profile.displayName, profile.industry, profile.city].filter(Boolean).length;
  if (filled >= 3) {
    recordProfileComplete();
  }
}

export default function ProfileEditor() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  function update(field: keyof UserProfile, value: string | string[]) {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    saveProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleItem(field: "stocks" | "crypto", item: string) {
    const current = profile[field];
    const updated = current.includes(item)
      ? current.filter((s) => s !== item)
      : [...current, item];
    update(field, updated);
  }

  const inputClass = "w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-label)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors";
  const labelClass = "text-[10px] uppercase tracking-wider text-[var(--text-label)] font-medium";
  const pillActive = "bg-[var(--accent-purple-dim)] text-[var(--accent-purple)]";
  const pillInactive = "bg-[var(--bg-input)] text-[var(--text-tertiary)] border border-[var(--border-primary)] hover:text-[var(--text-secondary)]";

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 bg-[var(--status-up)]/10 border border-[var(--status-up)]/20 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-[var(--status-up)]" />
          <span className="text-xs text-[var(--status-up)]">Profile saved</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className={labelClass}>Display Name</label>
        <input
          type="text"
          value={profile.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          placeholder="Anonymous Oracle"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Industry</label>
        <div className="flex flex-wrap gap-1.5">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => update("industry", ind)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                profile.industry === ind ? pillActive : pillInactive
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Job Role</label>
        <input
          type="text"
          value={profile.jobRole}
          onChange={(e) => update("jobRole", e.target.value)}
          placeholder="e.g. Software Engineer, Marketing Manager"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>City</label>
        <input
          type="text"
          value={profile.city}
          onChange={(e) => update("city", e.target.value)}
          placeholder="e.g. New York, San Francisco"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Housing Status</label>
        <div className="flex gap-2">
          {[
            { value: "owner", label: "Homeowner" },
            { value: "renter", label: "Renter" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("housing", opt.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                profile.housing === opt.value ? pillActive : pillInactive
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Stocks You Track</label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_STOCKS.map((stock) => (
            <button
              key={stock}
              onClick={() => toggleItem("stocks", stock)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                profile.stocks.includes(stock)
                  ? "bg-[var(--status-up)]/15 text-[var(--status-up)]"
                  : pillInactive
              }`}
            >
              {stock}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Crypto You Track</label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_CRYPTO.map((coin) => (
            <button
              key={coin}
              onClick={() => toggleItem("crypto", coin)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                profile.crypto.includes(coin)
                  ? "bg-[var(--accent-purple-dim)] text-[var(--accent-purple)]"
                  : pillInactive
              }`}
            >
              {coin}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
