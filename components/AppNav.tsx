"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { supabaseBrowser } from "@/lib/supabase/client";
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
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const [{ count }, { data: me }] = await Promise.all([
        supabase
          .from("friend_requests")
          .select("*", { count: "exact", head: true })
          .eq("to_user_id", user.id)
          .eq("status", "pending"),
        supabase.from("users").select("is_admin").eq("id", user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      setPendingRequests(count ?? 0);
      setIsAdmin(!!me?.is_admin);
    }

    refresh();
    const interval = setInterval(refresh, 45000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // Re-check when navigating between tabs so the badge clears quickly.
  }, [supabase, pathname]);

  function Badge() {
    if (pendingRequests === 0) return null;
    return (
      <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
        {pendingRequests}
      </span>
    );
  }

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
                    "relative rounded-full px-4 py-2 text-sm font-bold transition-colors",
                    active
                      ? "bg-ink text-cream"
                      : "text-ink-soft hover:bg-sand hover:text-ink"
                  )}
                >
                  {tab.label}
                  {tab.href === "/sisters" && <Badge />}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-terracotta text-white"
                    : "text-terracotta hover:bg-blush/50"
                )}
              >
                Admin
              </Link>
            )}
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
                <span className="relative text-lg leading-none">
                  {tab.icon}
                  {tab.href === "/sisters" && <Badge />}
                </span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
