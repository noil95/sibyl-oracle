import AppShell from "../components/AppShell";
import ContagionGraph from "../components/ContagionGraph";

export default function HeatmapPage() {
  return (
    <AppShell maxWidth="max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Prediction Network
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Force-directed graph showing prediction contagion across domains
        </p>
      </div>
      <ContagionGraph />
    </AppShell>
  );
}
