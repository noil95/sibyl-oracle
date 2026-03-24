import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white bg-mesh">
      <header className="border-b border-white/5 px-4 sm:px-6 py-4 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a1a]/80">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 flex items-center justify-center text-sm font-black shadow-lg shadow-purple-500/20">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Sibyl Oracle
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                AI-Powered Predictions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 live-dot" />
            <span className="text-xs text-white/50 font-medium">Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Dashboard />
      </main>

      <footer className="border-t border-white/5 px-4 sm:px-6 py-8 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            Sibyl Oracle — Predictions are probabilistic estimates, not guarantees.
          </p>
          <p className="text-xs text-white/20">
            Updated every 15 minutes from news, social media, and polling data.
          </p>
        </div>
      </footer>
    </div>
  );
}
