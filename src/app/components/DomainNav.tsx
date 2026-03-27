"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DOMAINS = [
  { href: "/", label: "Feed", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4", gradient: "from-violet-500 to-purple-500" },
  { href: "/politics", label: "Politics", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", gradient: "from-blue-500 to-cyan-500" },
  { href: "/economic", label: "Economy", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", gradient: "from-emerald-500 to-teal-500" },
  { href: "/tech", label: "Tech", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", gradient: "from-orange-500 to-amber-500" },
  { href: "/ripples", label: "Ripples", icon: "M13 10V3L4 14h7v7l9-11h-7z", gradient: "from-pink-500 to-rose-500" },
  { href: "/globe", label: "Globe", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", gradient: "from-cyan-500 to-blue-500" },
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
