import AppShell from "../components/AppShell";
import OracleScore from "../components/OracleScore";
import ProfileEditor from "../components/ProfileEditor";

export default function ProfilePage() {
  return (
    <AppShell subtitle="Your Profile" maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-label)] font-semibold">
            Oracle Score
          </h2>
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-6">
            <OracleScore />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-label)] font-semibold">
            Your Profile
          </h2>
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-6">
            <ProfileEditor />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
