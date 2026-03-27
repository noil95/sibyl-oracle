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
    <nav className="flex items-center gap-0 overflow-x-auto scrollbar-hide -mb-px">
      {DOMAINS.map((domain) => {
        const isActive =
          domain.href === "/"
            ? pathname === "/"
            : pathname.startsWith(domain.href);

        return (
          <Link
            key={domain.href}
            href={domain.href}
            className={`relative px-4 py-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "text-white"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {domain.label}
            {isActive && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--accent-purple)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
