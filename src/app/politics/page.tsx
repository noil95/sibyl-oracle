import AppShell from "../components/AppShell";
import Dashboard from "../components/Dashboard";

export default function PoliticsPage() {
  return (
    <AppShell maxWidth="max-w-5xl" showFooter footerText="Updated every 15 minutes from news, social media, and polling data">
      <Dashboard />
    </AppShell>
  );
}
