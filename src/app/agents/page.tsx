"use client";

import AppShell from "@/app/components/AppShell";
import AgentCard from "@/app/components/AgentCard";
import personas from "@/lib/agents/personas.json";

export default function AgentsPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Agent Interrogation Room
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Challenge AI analysts with different perspectives
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {personas.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
