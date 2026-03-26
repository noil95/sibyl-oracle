"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PredictionCard from "./PredictionCard";
import ScoreHistory from "./ScoreHistory";
import ImpactPanel from "./ImpactPanel";
import ShareButton from "./ShareButton";

interface Candidate {
  id: string;
  name: string;
  party: string;
}

interface Prediction {
  candidate_id: string;
  win_probability: number;
  confidence: number;
  computed_at: string;
}

interface HistoryPoint {
  computed_at: string;
  win_probability: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [predictions, setPredictions] = useState<Map<string, Prediction>>(
    new Map()
  );
  const [history, setHistory] = useState<Record<string, HistoryPoint[]>>({});
  const [electionName, setElectionName] = useState("");
  const [electionDate, setElectionDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/predictions");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setCandidates(data.candidates);
        setElectionName(data.election.name);
        setElectionDate(data.election.date);
        setHistory(data.history);

        const predMap = new Map<string, Prediction>();
        for (const p of data.predictions) {
          predMap.set(p.candidate_id, p);
        }
        setPredictions(predMap);

        if (data.predictions.length > 0) {
          setLastUpdated(data.predictions[0].computed_at);
        }
      } catch (err) {
        console.error("Error loading predictions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("predictions-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "predictions" },
        (payload) => {
          const newPrediction = payload.new as Prediction;
          setPredictions((prev) => {
            const updated = new Map(prev);
            updated.set(newPrediction.candidate_id, newPrediction);
            return updated;
          });
          setLastUpdated(newPrediction.computed_at);

          setHistory((prev) => ({
            ...prev,
            [newPrediction.candidate_id]: [
              ...(prev[newPrediction.candidate_id] || []),
              {
                computed_at: newPrediction.computed_at,
                win_probability: newPrediction.win_probability,
              },
            ],
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--border-primary)] border-t-[var(--accent-purple)] rounded-full" />
        <p className="text-sm text-[var(--text-tertiary)]">Loading predictions...</p>
      </div>
    );
  }

  const daysUntil = Math.ceil(
    (new Date(electionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-8">
      {/* Election header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {electionName}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--text-label)]">
          <span className="bg-[var(--bg-card)] px-3 py-1 rounded-md border border-[var(--border-primary)]">
            {new Date(electionDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="bg-[var(--bg-card)] px-3 py-1 rounded-md border border-[var(--border-primary)]">
            {daysUntil} days away
          </span>
          {lastUpdated && (
            <span className="bg-[var(--bg-card)] px-3 py-1 rounded-md border border-[var(--border-primary)]">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Prediction cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {candidates.map((candidate) => {
          const pred = predictions.get(candidate.id);
          return (
            <PredictionCard
              key={candidate.id}
              candidateName={candidate.name}
              party={candidate.party}
              winProbability={pred?.win_probability ?? 0.5}
              confidence={pred?.confidence ?? 0}
            />
          );
        })}
      </div>

      {/* Data sources */}
      <div className="flex justify-center">
        <div className="flex items-center gap-3 text-xs text-[var(--text-label)]">
          <span className="uppercase tracking-wider text-[10px]">Sources</span>
          {["NewsAPI", "Reddit", "Polls"].map((source) => (
            <span
              key={source}
              className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]"
            >
              {source}
            </span>
          ))}
        </div>
      </div>

      {/* Share button */}
      <div className="flex justify-center">
        <ShareButton
          predictions={candidates.map((c) => ({
            candidateName: c.name,
            winProbability:
              predictions.get(c.id)?.win_probability ?? 0.5,
          }))}
        />
      </div>

      {/* Score history charts */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-[var(--text-label)] font-semibold">
          Prediction History
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5"
            >
              <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-3">
                {candidate.name}
                <span className="ml-2 text-[var(--text-tertiary)]">({candidate.party})</span>
              </h4>
              <ScoreHistory
                data={history[candidate.id] || []}
                candidateName={candidate.name}
                party={candidate.party}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Personal impact */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-label)] font-semibold">
            Personal Impact Analysis
          </h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            How this election outcome could affect your career and industry
          </p>
        </div>
        <ImpactPanel
          candidates={candidates.map((c) => ({
            name: c.name,
            winProbability:
              predictions.get(c.id)?.win_probability ?? 0.5,
          }))}
        />
      </div>
    </div>
  );
}
