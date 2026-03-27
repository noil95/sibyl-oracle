import AppShell from "./components/AppShell";
import PredictionFeed from "./components/PredictionFeed";

export default function Home() {
  return (
    <AppShell showFooter>
      {/* Hero */}
      <div className="relative mb-8 py-6">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-blue-600/5 to-cyan-600/5 rounded-2xl" />
        <div className="relative px-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-violet-500/40 to-transparent" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Live Predictions
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/40 to-transparent" />
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-black text-center tracking-tight">
            <span className="gradient-text">Prediction Markets</span>
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] text-center mt-2 max-w-md mx-auto">
            AI-powered forecasts across politics, economics, and technology — updated in real-time
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 mt-5">
            {[
              { value: "20+", label: "Markets", gradient: "from-violet-500 to-purple-500" },
              { value: "7", label: "Sources", gradient: "from-blue-500 to-cyan-500" },
              { value: "24/7", label: "Live Data", gradient: "from-emerald-500 to-teal-500" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-[18px] font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-[var(--text-label)] uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PredictionFeed />
    </AppShell>
  );
}
