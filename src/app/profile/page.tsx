import DomainNav from "../components/DomainNav";
import OracleScore from "../components/OracleScore";
import ProfileEditor from "../components/ProfileEditor";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] bg-subtle">
      <header className="border-b border-[var(--border-primary)] px-4 sm:px-6 py-4 sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-purple)] flex items-center justify-center text-sm font-bold text-white">
                S
              </div>
              <div>
                <h1 className="text-base font-semibold text-[var(--text-primary)]">
                  Sibyl Oracle
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-label)]">
                  Your Profile
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-primary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-up)] live-dot" />
              <span className="text-[10px] text-[var(--text-label)] font-medium">Live</span>
            </div>
          </div>
          <DomainNav />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-wider text-[var(--text-label)] font-semibold">
              Oracle Score
            </h2>
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-6">
              <OracleScore />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-wider text-[var(--text-label)] font-semibold">
              Your Profile
            </h2>
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-6">
              <ProfileEditor />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
