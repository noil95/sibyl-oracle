"use client";

import { useParams } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import AgentChat from "@/app/components/AgentChat";
import personas from "@/lib/agents/personas.json";

export default function AgentChatPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const agent = personas.find((p) => p.id === agentId);

  if (!agent) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-4xl">🔍</p>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Agent not found</h1>
          <p className="text-[13px] text-[var(--text-secondary)]">
            The agent &ldquo;{agentId}&rdquo; does not exist.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{agent.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{agent.name}</h1>
            <p className="text-[12px] text-[var(--text-secondary)] capitalize">
              {agent.bias} · {agent.domain}
            </p>
          </div>
        </div>

        <AgentChat
          agentId={agent.id}
          agentName={agent.name}
          agentEmoji={agent.emoji}
        />
      </div>
    </AppShell>
  );
}
