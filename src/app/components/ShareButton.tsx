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
      className={`group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
        copied
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
      }`}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied to clipboard
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
          Share Prediction
        </>
      )}
    </button>
  );
}
