"use client";

import { useState } from "react";

interface ShareButtonProps {
  predictions: { candidateName: string; winProbability: number }[];
}

export default function ShareButton({ predictions }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const topCandidate = predictions.reduce((a, b) =>
      a.winProbability > b.winProbability ? a : b
    );
    const pct = Math.round(topCandidate.winProbability * 100);

    const text = `${topCandidate.candidateName} is at ${pct}% to win the PA Senate race — live AI prediction updating in real-time.`;
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (navigator.share) {
      try {
        await navigator.share({ text, url });
        return;
      } catch {
        // Fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
        copied
          ? "bg-[var(--status-up)]/10 text-[var(--status-up)] border border-[var(--status-up)]/20"
          : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
      }`}
    >
      {copied ? "Copied to clipboard" : "Share Prediction"}
    </button>
  );
}
