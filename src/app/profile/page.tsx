import AppShell from "../components/AppShell";
import OracleScore from "../components/OracleScore";
import ProfileEditor from "../components/ProfileEditor";

export default function ProfilePage() {
  return (
    <AppShell maxWidth="max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-[24px] font-bold text-white tracking-tight">Profile</h2>
        </div>
        <p className="text-[13px] text-[var(--text-tertiary)]">
          Customize your predictions and track your Oracle Score
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-[10px] uppercase tracking-widest text-violet-400 font-bold flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Oracle Score
          </h3>
          <div className="glass-card rounded-xl p-6">
            <OracleScore />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] uppercase tracking-widest text-pink-400 font-bold flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            Your Profile
          </h3>
          <div className="glass-card rounded-xl p-6">
            <ProfileEditor />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
