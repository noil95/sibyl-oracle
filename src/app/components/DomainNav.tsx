"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DOMAINS = [
  { href: "/", label: "Feed" },
  { href: "/politics", label: "Politics" },
  { href: "/economic", label: "Economy" },
  { href: "/tech", label: "Tech" },
  { href: "/ripples", label: "Ripples" },
  { href: "/globe", label: "Globe" },
  { href: "/profile", label: "Profile" },
];

export default function DomainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
      {DOMAINS.map((domain) => {
        const isActive =
          domain.href === "/"
            ? pathname === "/"
            : pathname.startsWith(domain.href);

        return (
          <Link
            key={domain.href}
            href={domain.href}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors relative ${
              isActive
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {domain.label}
            {isActive && (
              <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-[var(--accent-purple)] rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
