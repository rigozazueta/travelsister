"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { ProfileModal } from "@/components/ProfileModal";
import { ReportModal } from "@/components/ReportModal";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

type IncomingRequest = { id: string; created_at: string; profile: Profile };
type Sister = { since: string; profile: Profile };

export default function SistersPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();

  const [meId, setMeId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [sisters, setSisters] = useState<Sister[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Profile | null>(null);
  const [reporting, setReporting] = useState<Profile | null>(null);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setMeId(user.id);

    const [{ data: requests }, { data: sent }, { data: friendships }] = await Promise.all([
      supabase
        .from("friend_requests")
        .select("id, created_at, from_user_id")
        .eq("to_user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("friend_requests")
        .select("id")
        .eq("from_user_id", user.id)
        .eq("status", "pending"),
      supabase
        .from("friendships")
        .select("friend_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    setSentCount((sent ?? []).length);

    const profileIds = [
      ...(requests ?? []).map((r) => r.from_user_id as string),
      ...(friendships ?? []).map((f) => f.friend_id as string),
    ];

    let profiles: Profile[] = [];
    if (profileIds.length > 0) {
      const { data } = await supabase.from("users").select("*").in("id", profileIds);
      profiles = (data ?? []) as Profile[];
    }
    const byId = new Map(profiles.map((p) => [p.id, p]));

    setIncoming(
      (requests ?? [])
        .map((r) => ({
          id: r.id as string,
          created_at: r.created_at as string,
          profile: byId.get(r.from_user_id as string),
        }))
        .filter((r): r is IncomingRequest => !!r.profile)
    );
    setSisters(
      (friendships ?? [])
        .map((f) => ({
          since: f.created_at as string,
          profile: byId.get(f.friend_id as string),
        }))
        .filter((s): s is Sister => !!s.profile)
    );
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // Fetch-on-mount: every setState in load() happens after an awaited
    // network call, so no synchronous cascading render occurs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load().catch(() => setLoading(false));
  }, [load]);

  async function respond(requestId: string, status: "accepted" | "declined") {
    await supabase.from("friend_requests").update({ status }).eq("id", requestId);
    await load();
  }

  async function message(profileId: string) {
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      other_user_id: profileId,
    });
    if (!error && data) router.push(`/messages/${data}`);
  }

  if (loading) {
    return <p className="py-24 text-center text-ink-soft">Gathering your circle…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-[2rem] font-light tracking-[-0.01em] text-ink">Your sisters</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {sisters.length} connection{sisters.length === 1 ? "" : "s"}
          {sentCount > 0 && ` · ${sentCount} request${sentCount === 1 ? "" : "s"} sent`}
        </p>
      </div>

      {incoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">
            Women who want to connect with you
          </h2>
          <div className="space-y-3">
            {incoming.map((req) => (
              <div
                key={req.id}
                className="animate-rise flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-card"
              >
                <button onClick={() => setViewing(req.profile)} aria-label="View profile">
                  <Avatar
                    name={req.profile.full_name}
                    photoUrl={req.profile.profile_photo_url}
                    size="lg"
                  />
                </button>
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setViewing(req.profile)}>
                  <p className="font-display text-lg font-medium text-ink">
                    {req.profile.full_name}
                    {req.profile.age ? `, ${req.profile.age}` : ""}
                  </p>
                  <p className="truncate text-sm text-ink-soft">
                    {req.profile.location} · {timeAgo(req.created_at)}
                  </p>
                  <div className="mt-1.5 hidden flex-wrap gap-1.5 sm:flex">
                    {(req.profile.interests ?? []).slice(0, 3).map((i) => (
                      <Chip key={i} label={i} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(req.id, "accepted")}
                    className="rounded-lg bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-deep"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respond(req.id, "declined")}
                    className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-sand"
                  >
                    Pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Your circle
        </h2>
        {sisters.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-card">
            <p className="mt-3 font-display text-xl font-medium text-ink">
              No connections yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
              Head to Discover and reach out — every sisterhood starts with one hello.
            </p>
            <Link
              href="/discover"
              className="mt-5 inline-block rounded-lg bg-terracotta px-6 py-3 text-sm font-semibold text-white hover:bg-terracotta-deep"
            >
              Start discovering
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {sisters.map(({ profile, since }) => (
              <div
                key={profile.id}
                className="animate-rise flex items-center gap-4 rounded-xl bg-white p-4 shadow-card"
              >
                <button onClick={() => setViewing(profile)} aria-label="View profile">
                  <Avatar name={profile.full_name} photoUrl={profile.profile_photo_url} size="lg" />
                </button>
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setViewing(profile)}>
                  <p className="truncate font-display text-lg font-medium text-ink">
                    {profile.full_name}
                  </p>
                  <p className="truncate text-sm text-ink-soft">{profile.location}</p>
                  <p className="text-xs text-ink-soft/70">Sisters since {timeAgo(since)}</p>
                </div>
                <button
                  onClick={() => message(profile.id)}
                  aria-label="Message"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink/15 text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
                >
                  <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {viewing && (
        <ProfileModal
          profile={viewing}
          onClose={() => setViewing(null)}
          onMessage={
            sisters.some((s) => s.profile.id === viewing.id)
              ? () => message(viewing.id)
              : undefined
          }
          onReport={() => {
            setReporting(viewing);
            setViewing(null);
          }}
        />
      )}

      {reporting && meId && (
        <ReportModal
          reporterId={meId}
          target={reporting}
          onClose={() => setReporting(null)}
          onDone={async () => {
            setReporting(null);
            await load();
          }}
        />
      )}

      {meId && sisters.length > 0 && (
        <section className="rounded-xl bg-blush/40 p-6 text-center">
          <p className="font-display text-xl font-medium text-ink">
            Ready to make it real?
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
            Pick a Nomara trip, send it to a sister, and meet in person — hosts and
            logistics handled.
          </p>
          <Link
            href="/trips"
            className="mt-4 inline-block rounded-lg bg-terracotta px-6 py-3 text-sm font-semibold text-white hover:bg-terracotta-deep"
          >
            Browse trips together
          </Link>
        </section>
      )}
    </div>
  );
}
