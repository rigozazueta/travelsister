"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/discover", label: "Discover", icon: "✨" },
  { href: "/sisters", label: "Sisters", icon: "✿" },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "/trips", label: "Trips", icon: "🌍" },
  { href: "/profile", label: "Profile", icon: "☺" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar (all screens) */}
      <header className="sticky top-0 z-40 border-b border-sand-deep bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Logo href="/discover" />
          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                    active
                      ? "bg-ink text-cream"
                      : "text-ink-soft hover:bg-sand hover:text-ink"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Bottom tab bar (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-deep bg-cream/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold",
                  active ? "text-terracotta" : "text-ink-soft"
                )}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
