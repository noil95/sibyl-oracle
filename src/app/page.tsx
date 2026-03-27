import AppShell from "./components/AppShell";
import PredictionFeed from "./components/PredictionFeed";

export default function Home() {
  return (
    <AppShell showFooter>
      <div className="mb-6">
        <h2 className="text-[22px] font-semibold text-white tracking-tight">
          Markets
        </h2>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
          Real-time AI predictions across politics, economy, and tech
        </p>
      </div>

      <PredictionFeed />
    </AppShell>
  );
}
