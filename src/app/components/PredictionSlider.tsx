"use client";

import { useState } from "react";
import { getUserId } from "@/lib/user-id";

interface PredictionSliderProps {
  tournamentId: string;
  currentValue?: number;
  onSubmit?: (value: number) => void;
}

type SubmitState = "idle" | "loading" | "success" | "error";

export default function PredictionSlider({
  tournamentId,
  currentValue,
  onSubmit,
}: PredictionSliderProps) {
  const initialPct = currentValue !== undefined ? Math.round(currentValue * 100) : 50;
  const [sliderPct, setSliderPct] = useState(initialPct);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSliderPct(Number(e.target.value));
    if (submitState !== "idle") setSubmitState("idle");
  }

  async function handleSubmit() {
    setSubmitState("loading");
    setErrorMessage("");

    const userId = getUserId();
    const probability = sliderPct / 100;

    try {
      const res = await fetch("/api/tournaments/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify({ tournamentId, probability }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      setSubmitState("success");
      onSubmit?.(probability);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failed");
      setSubmitState("error");
    }
  }

  const pctColor =
    sliderPct >= 70
      ? "text-[var(--status-up)]"
      : sliderPct <= 30
      ? "text-[var(--status-down)]"
      : "text-white";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-6 space-y-6">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)] mb-2">
          Your Probability Estimate
        </p>
        <div className={`text-[64px] font-black leading-none number-display ${pctColor}`}>
          {sliderPct}
          <span className="text-[32px] text-[var(--text-tertiary)]">%</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative px-1">
        <input
          type="range"
          min={0}
          max={100}
          value={sliderPct}
          onChange={handleChange}
          className="w-full accent-violet-500 cursor-pointer"
          style={{ height: "6px" }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-[var(--text-tertiary)]">0% — No</span>
          <span className="text-[11px] text-[var(--text-tertiary)]">Yes — 100%</span>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitState === "loading" || submitState === "success"}
        className="w-full py-3 px-6 rounded-xl font-semibold text-[14px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background:
            submitState === "success"
              ? "var(--gradient-up)"
              : "var(--gradient-purple)",
          color: "white",
        }}
      >
        {submitState === "loading" && "Submitting…"}
        {submitState === "success" && "Prediction Recorded!"}
        {submitState === "error" && "Try Again"}
        {submitState === "idle" && "Submit Prediction"}
      </button>

      {/* Error */}
      {submitState === "error" && errorMessage && (
        <p className="text-[12px] text-[var(--status-down)] text-center">
          {errorMessage}
        </p>
      )}

      {/* Brier score note */}
      <p className="text-[11px] text-[var(--text-tertiary)] text-center leading-relaxed">
        Scored by Brier score — lower is better. Be calibrated, not bold.
      </p>
    </div>
  );
}
