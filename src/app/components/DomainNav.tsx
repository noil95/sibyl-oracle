"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DOMAINS = [
  { href: "/", label: "Feed", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4", gradient: "from-violet-500 to-purple-500" },
  { href: "/politics", label: "Politics", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", gradient: "from-blue-500 to-cyan-500" },
  { href: "/economic", label: "Economy", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", gradient: "from-emerald-500 to-teal-500" },
  { href: "/tech", label: "Tech", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", gradient: "from-orange-500 to-amber-500" },
  { href: "/tournaments", label: "Tournaments", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", gradient: "from-yellow-500 to-orange-500" },
  { href: "/heatmap", label: "Heatmap", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", gradient: "from-teal-500 to-cyan-500" },
  { href: "/agents", label: "Agents", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", gradient: "from-indigo-500 to-violet-500" },
  { href: "/profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", gradient: "from-purple-500 to-pink-500" },
];

export default function DomainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
      {DOMAINS.map((domain) => {
        const isActive =
          domain.href === "/"
            ? pathname === "/"
            : pathname.startsWith(domain.href);

        return (
          <Link
            key={domain.href}
            href={domain.href}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
              isActive
                ? `bg-gradient-to-r ${domain.gradient} text-white shadow-lg shadow-purple-500/10`
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d={domain.icon} />
            </svg>
            <span className="hidden sm:inline">{domain.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
