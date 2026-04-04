"use client";

import { useState } from "react";
import AppShell from "@/app/components/AppShell";
import StressTest from "@/app/components/StressTest";
import ShockBuilder from "@/app/components/ShockBuilder";

interface Scenario {
  id: string;
  name: string;
  overrides: Record<string, number>;
}

interface FragilityResult {
  slug: string;
  originalScore: number;
  shockedScore: number;
  fragility: number;
  direction: "up" | "down" | "stable";
}

const SCENARIOS: Scenario[] = [
  { id: "btc-crash", name: "Black Swan: Bitcoin -50%", overrides: { bitcoin: 0.05 } },
  { id: "oil-shock", name: "Oil Shock: Crude +80%", overrides: { "oil-price": 0.95 } },
  { id: "flash-crash", name: "Flash Crash: S&P -15%", overrides: { sp500: 0.15 } },
  { id: "fed-pivot", name: "Fed Pivot: Rates Cut", overrides: { "fed-rate": 0.1 } },
  { id: "ai-crackdown", name: "AI Regulation: Tech Crackdown", overrides: { "ai-regulation": 0.9 } },
  { id: "inflation-surge", name: "Inflation Surge: CPI 8%", overrides: { inflation: 0.95 } },
];

function ScenarioIcon({ id }: { id: string }) {
  const icons: Record<string, string> = {
    "btc-crash": "₿",
    "oil-shock": "🛢",
    "flash-crash": "📉",
    "fed-pivot": "🏦",
    "ai-crackdown": "🤖",
    "inflation-surge": "📈",
  };
  return <span className="text-xl">{icons[id] ?? "⚡"}</span>;
}

export default function RedTeamPage() {
  const [results, setResults] = useState<FragilityResult[]>([]);
  const [scenarioName, setScenarioName] = useState("");
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runScenario(scenario: Scenario) {
    setLoading(scenario.id);
    setError(null);

    try {
      const res = await fetch(`/api/redteam?scenario=${scenario.id}`);
      if (!res.ok) throw new Error("Stress test failed");
      const data = await res.json();
      setResults(data.results);
      setScenarioName(data.scenarioName);
      setActiveScenario(scenario.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  }

  function handleCustomResults(customResults: unknown[], name: string) {
    setResults(customResults as FragilityResult[]);
    setScenarioName(name);
    setActiveScenario(null);
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Red Team Mode</h1>
          </div>
          <p className="text-[13px] text-[var(--text-tertiary)] max-w-lg">
            Stress-test the prediction network against shock scenarios to find the most fragile predictions.
          </p>
        </div>

        {/* Preset scenario cards */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium mb-3">
            Preset Scenarios
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => runScenario(scenario)}
                disabled={loading === scenario.id}
                className={[
                  "text-left bg-[var(--bg-card)] border rounded-xl p-4 transition-all hover:border-red-500/50 hover:shadow-[0_0_12px_rgba(239,68,68,0.1)] group",
                  activeScenario === scenario.id
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-[var(--border-primary)]",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <ScenarioIcon id={scenario.id} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-white transition-colors">
                      {scenario.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                      {Object.entries(scenario.overrides)
                        .map(([k, v]) => `${k}: ${Math.round(v * 100)}%`)
                        .join(", ")}
                    </p>
                  </div>
                  {loading === scenario.id && (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-[13px]">{error}</p>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
              Results
            </p>
            <StressTest results={results} scenarioName={scenarioName} />
          </div>
        )}

        {/* Custom builder */}
        <div className="border-t border-[var(--border-primary)] pt-6 space-y-3">
          <p className="text-[11px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
            Custom Shock Builder
          </p>
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
            <ShockBuilder onResults={handleCustomResults} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
