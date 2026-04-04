"use client";

import Link from "next/link";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    emoji: string;
    bias: string;
    domain: string;
    personality: string;
  };
}

const BIAS_BADGE: Record<string, string> = {
  bullish: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  bearish: "bg-red-500/15 text-red-400 border-red-500/30",
  neutral: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  contrarian: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

export default function AgentCard({ agent }: AgentCardProps) {
  const biasCls = BIAS_BADGE[agent.bias] ?? BIAS_BADGE.neutral;

  return (
    <Link
      href={`/agents/${agent.id}`}
      className="flex flex-col gap-3 p-5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl card-hover transition-all"
    >
      <div className="text-5xl leading-none">{agent.emoji}</div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">
          {agent.name}
        </h3>
        <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {agent.personality}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-[var(--bg-primary)] text-[var(--text-tertiary)] border-[var(--border-primary)] capitalize">
          {agent.domain}
        </span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${biasCls}`}>
          {agent.bias}
        </span>
      </div>
    </Link>
  );
}
