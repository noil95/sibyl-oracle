"use client";

import { useState, useEffect } from "react";
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
  // profile completion tracking removed with gamification module
}

export default function ProfileEditor() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setProfile(getProfile()); }, []);

  function update(field: keyof UserProfile, value: string | string[]) {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    saveProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleItem(field: "stocks" | "crypto", item: string) {
    const current = profile[field];
    update(field, current.includes(item) ? current.filter((s) => s !== item) : [...current, item]);
  }

  const inputClass = "w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-[var(--text-label)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors";
  const labelClass = "text-[10px] uppercase tracking-wider text-[var(--text-label)] font-semibold block mb-1.5";

  return (
    <div className="space-y-5">
      {saved && (
        <div className="flex items-center gap-2 bg-[var(--status-up-dim)] rounded-lg px-3 py-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-up)]" />
          <span className="text-[11px] text-[var(--status-up)]">Saved</span>
        </div>
      )}

      <div>
        <label className={labelClass}>Display Name</label>
        <input type="text" value={profile.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="Anonymous Oracle" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Industry</label>
        <div className="flex flex-wrap gap-1.5">
          {INDUSTRIES.map((ind) => (
            <button key={ind} onClick={() => update("industry", ind)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                profile.industry === ind
                  ? "bg-[var(--accent-purple)] text-white"
                  : "bg-[var(--bg-input)] text-[var(--text-tertiary)] border border-[var(--border-primary)] hover:text-[var(--text-secondary)]"
              }`}
            >{ind}</button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Job Role</label>
        <input type="text" value={profile.jobRole} onChange={(e) => update("jobRole", e.target.value)} placeholder="e.g. Software Engineer" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>City</label>
        <input type="text" value={profile.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g. New York" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Housing</label>
        <div className="flex gap-2">
          {[{ value: "owner", label: "Homeowner" }, { value: "renter", label: "Renter" }].map((opt) => (
            <button key={opt.value} onClick={() => update("housing", opt.value)}
              className={`flex-1 py-2.5 rounded-lg text-[12px] font-medium transition-colors ${
                profile.housing === opt.value
                  ? "bg-[var(--accent-purple)] text-white"
                  : "bg-[var(--bg-input)] text-[var(--text-tertiary)] border border-[var(--border-primary)]"
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Stocks</label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_STOCKS.map((s) => (
            <button key={s} onClick={() => toggleItem("stocks", s)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-mono font-medium transition-colors ${
                profile.stocks.includes(s)
                  ? "bg-[var(--status-up)] text-white"
                  : "bg-[var(--bg-input)] text-[var(--text-tertiary)] border border-[var(--border-primary)]"
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Crypto</label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_CRYPTO.map((c) => (
            <button key={c} onClick={() => toggleItem("crypto", c)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-mono font-medium transition-colors ${
                profile.crypto.includes(c)
                  ? "bg-[var(--accent-purple)] text-white"
                  : "bg-[var(--bg-input)] text-[var(--text-tertiary)] border border-[var(--border-primary)]"
              }`}
            >{c}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
