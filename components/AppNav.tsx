"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Compass,
  Flower2,
  MessageCircle,
  Earth,
  CircleUserRound,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/discover", label: "Discover", Icon: Compass },
  { href: "/sisters", label: "Sisters", Icon: Flower2 },
  { href: "/messages", label: "Messages", Icon: MessageCircle },
  { href: "/trips", label: "Trips", Icon: Earth },
  { href: "/profile", label: "Profile", Icon: CircleUserRound },
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
      <span className="absolute -right-2 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-terracotta px-1 text-[9px] font-bold text-white">
        {pendingRequests}
      </span>
    );
  }

  return (
    <>
      {/* Top bar (all screens) */}
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Logo href="/discover" />
          <nav className="hidden items-center gap-7 md:flex">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "relative pb-0.5 text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors",
                    active ? "text-ink" : "text-ink-soft hover:text-ink"
                  )}
                >
                  {tab.label}
                  {tab.href === "/sisters" && <Badge />}
                  <span
                    className={cn(
                      "absolute -bottom-[5px] left-0 h-px w-full bg-terracotta transition-opacity",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors",
                  pathname.startsWith("/admin")
                    ? "text-terracotta"
                    : "text-terracotta/70 hover:text-terracotta"
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Bottom tab bar (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/8 bg-cream/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-[0.04em]",
                  active ? "text-ink" : "text-ink-soft/80"
                )}
              >
                <span className="relative">
                  <tab.Icon
                    className="h-[21px] w-[21px]"
                    strokeWidth={active ? 2 : 1.5}
                  />
                  {tab.href === "/sisters" && <Badge />}
                </span>
                {tab.label}
                <span
                  className={cn(
                    "h-1 w-1 rounded-full bg-terracotta",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
