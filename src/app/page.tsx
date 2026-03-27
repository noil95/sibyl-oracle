import AppShell from "./components/AppShell";
import PredictionFeed from "./components/PredictionFeed";

export default function Home() {
  return (
    <AppShell showFooter footerText="Powered by FRED, BLS, Yahoo Finance, CoinGecko, EIA, NewsAPI, Reddit">
      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Prediction Feed
        </h2>
        <p className="text-[13px] text-[var(--text-tertiary)]">
          Real-time predictions across politics, economy, and tech
        </p>
      </div>

      <PredictionFeed />
    </AppShell>
  );
}
