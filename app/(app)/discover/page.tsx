"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { ReportModal } from "@/components/ReportModal";
import { nomaraLink } from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { firstName, sharedDestinations, sharedInterests } from "@/lib/utils";

type Candidate = Profile & { incomingRequestId?: string };

export default function DiscoverPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();

  const [me, setMe] = useState<Profile | null>(null);
  const [deck, setDeck] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [match, setMatch] = useState<Candidate | null>(null);
  const [reporting, setReporting] = useState<Candidate | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: myProfile },
        { data: swipes },
        { data: friends },
        { data: requests },
        { data: blockedIds },
      ] = await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).single(),
        supabase.from("swipes").select("target_user_id").eq("user_id", user.id),
        supabase.from("friendships").select("friend_id").eq("user_id", user.id),
        supabase
          .from("friend_requests")
          .select("id, from_user_id, to_user_id, status")
          .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
          .eq("status", "pending"),
        supabase.rpc("blocked_user_ids"),
      ]);

      const profile = myProfile as Profile;
      setMe(profile);

      const exclude = new Set<string>([user.id]);
      (swipes ?? []).forEach((s) => exclude.add(s.target_user_id as string));
      (friends ?? []).forEach((f) => exclude.add(f.friend_id as string));
      ((blockedIds ?? []) as string[]).forEach((id) => exclude.add(id));
      // Hide women I already sent a request to; keep women who requested me.
      const incomingByUser = new Map<string, string>();
      (requests ?? []).forEach((r) => {
        if (r.from_user_id === user.id) exclude.add(r.to_user_id as string);
        else incomingByUser.set(r.from_user_id as string, r.id as string);
      });

      const { data: candidates } = await supabase
        .from("users")
        .select("*")
        .eq("onboarding_complete", true)
        .neq("id", user.id)
        .limit(100);

      const scored = ((candidates ?? []) as Profile[])
        .filter((c) => !exclude.has(c.id))
        .map((c) => ({
          ...c,
          incomingRequestId: incomingByUser.get(c.id),
        }))
        .sort((a, b) => {
          const scoreOf = (p: Candidate) =>
            (p.incomingRequestId ? 100 : 0) +
            sharedInterests(profile, p).length * 3 +
            sharedDestinations(profile, p).length * 2;
          return scoreOf(b) - scoreOf(a);
        });

      setDeck(scored);
      setLoading(false);
    })();
  }, [supabase]);

  const current = deck[0];

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  }

  async function pass() {
    if (!me || !current || busy) return;
    setBusy(true);
    await supabase
      .from("swipes")
      .insert({ user_id: me.id, target_user_id: current.id, action: "pass" });
    setDeck((d) => d.slice(1));
    setBusy(false);
  }

  async function connect() {
    if (!me || !current || busy) return;
    setBusy(true);
    const target = current;

    await supabase
      .from("swipes")
      .insert({ user_id: me.id, target_user_id: target.id, action: "like" });

    if (target.incomingRequestId) {
      // She already reached out — accepting creates the friendship. It's a match!
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", target.incomingRequestId);
      if (!error) setMatch(target);
      else showToast("Something went wrong — try again from your Sisters tab.");
    } else {
      const { error } = await supabase
        .from("friend_requests")
        .insert({ from_user_id: me.id, to_user_id: target.id });
      if (!error) {
        showToast(`Request sent to ${firstName(target.full_name)} 💌`);
      } else if (error.code === "23505") {
        // A pending request already exists in the other direction — accept it.
        const { data: incoming } = await supabase
          .from("friend_requests")
          .select("id")
          .eq("from_user_id", target.id)
          .eq("to_user_id", me.id)
          .eq("status", "pending")
          .maybeSingle();
        if (incoming) {
          await supabase
            .from("friend_requests")
            .update({ status: "accepted" })
            .eq("id", incoming.id);
          setMatch(target);
        }
      } else {
        showToast("Couldn't send that request — please try again.");
      }
    }

    setDeck((d) => d.slice(1));
    setBusy(false);
  }

  async function messageMatch() {
    if (!match) return;
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      other_user_id: match.id,
    });
    if (!error && data) router.push(`/messages/${data}`);
  }

  if (loading || !me) {
    return <p className="py-24 text-center text-ink-soft">Finding your people…</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">Discover</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {deck.length > 0
            ? `${deck.length} ${deck.length === 1 ? "woman" : "women"} who travel like you`
            : "You're all caught up"}
        </p>
      </div>

      {current ? (
        <article key={current.id} className="animate-rise overflow-hidden rounded-[2rem] bg-white shadow-soft">
          {/* Photo / header */}
          <div className="relative">
            {current.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.profile_photo_url}
                alt={current.full_name ?? "Member"}
                className="h-80 w-full object-cover"
              />
            ) : (
              <div className="flex h-80 w-full items-center justify-center bg-gradient-to-br from-blush to-sand">
                <Avatar name={current.full_name} size="xl" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-6 pb-4 pt-16">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-white">
                    {firstName(current.full_name)}
                    {current.age ? `, ${current.age}` : ""}
                  </h2>
                  <p className="text-sm font-medium text-white/85">{current.location}</p>
                </div>
                {current.verification_status === "verified" && (
                  <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-white">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
            {current.incomingRequestId && (
              <span className="absolute left-4 top-4 animate-pop rounded-full bg-terracotta px-3.5 py-1.5 text-xs font-bold text-white shadow-soft">
                She reached out to you 💌
              </span>
            )}
          </div>

          <div className="space-y-5 p-6">
            <p className="leading-relaxed text-ink">{current.bio}</p>

            <div className="flex flex-wrap gap-2 text-xs font-bold text-ink-soft">
              {current.travel_style && (
                <span className="rounded-full bg-sand px-3 py-1.5">{current.travel_style}</span>
              )}
              {current.travel_frequency && (
                <span className="rounded-full bg-sand px-3 py-1.5">{current.travel_frequency}</span>
              )}
              {(current.languages ?? []).length > 0 && (
                <span className="rounded-full bg-sand px-3 py-1.5">
                  Speaks {(current.languages ?? []).join(", ")}
                </span>
              )}
            </div>

            {(current.interests ?? []).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                  Into
                </p>
                <div className="flex flex-wrap gap-2">
                  {(current.interests ?? []).map((interest) => (
                    <Chip
                      key={interest}
                      label={interest}
                      highlight={sharedInterests(me, current).includes(interest)}
                    />
                  ))}
                </div>
              </div>
            )}

            {(current.desired_destinations ?? []).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                  Dreaming of
                </p>
                <div className="flex flex-wrap gap-2">
                  {(current.desired_destinations ?? []).map((dest) => (
                    <Chip
                      key={dest}
                      label={dest}
                      highlight={sharedDestinations(me, current).includes(dest)}
                    />
                  ))}
                </div>
              </div>
            )}

            {(current.prompts ?? []).map((prompt) => (
              <blockquote key={prompt.question} className="rounded-2xl bg-cream p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-sage-deep">
                  {prompt.question}
                </p>
                <p className="mt-1 font-display text-lg italic text-ink">“{prompt.answer}”</p>
              </blockquote>
            ))}
          </div>

          <div className="flex items-center justify-center gap-5 border-t border-sand px-6 py-5">
            <button
              onClick={pass}
              disabled={busy}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-sand-deep bg-white text-xl text-ink-soft transition-all hover:scale-105 hover:border-ink-soft disabled:opacity-50"
              aria-label="Pass"
            >
              ✕
            </button>
            <button
              onClick={connect}
              disabled={busy}
              className="flex h-16 items-center gap-2 rounded-full bg-terracotta px-8 text-base font-bold text-white shadow-soft transition-all hover:scale-105 hover:bg-terracotta-deep disabled:opacity-50"
            >
              ✿ Connect
            </button>
          </div>
          <button
            onClick={() => setReporting(current)}
            className="block w-full pb-4 text-center text-xs font-semibold text-ink-soft/70 hover:text-terracotta"
          >
            ⚑ Report this profile
          </button>
        </article>
      ) : (
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-card">
          <p className="text-4xl">🌅</p>
          <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
            You’ve met everyone (for now)
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-ink-soft">
            New women join all the time. Meanwhile — the fastest way to meet travel
            sisters is on an actual trip.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              href="/trips"
              className="rounded-full bg-terracotta px-7 py-3 text-sm font-bold text-white hover:bg-terracotta-deep"
            >
              Browse Nomara trips
            </Link>
            <a
              href={nomaraLink("/", "discover-empty")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-ink-soft hover:text-ink"
            >
              or see everything on nomaratravel.com ↗
            </a>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-pop rounded-full bg-ink px-6 py-3 text-sm font-bold text-cream shadow-soft md:bottom-10">
          {toast}
        </div>
      )}

      {/* Report modal */}
      {reporting && me && (
        <ReportModal
          reporterId={me.id}
          target={reporting}
          onClose={() => setReporting(null)}
          onDone={async (blocked) => {
            // She shouldn't reappear in the deck either way.
            await supabase
              .from("swipes")
              .insert({ user_id: me.id, target_user_id: reporting.id, action: "pass" });
            setDeck((d) => d.filter((c) => c.id !== reporting.id));
            setReporting(null);
            showToast(blocked ? "Reported and blocked. Thank you 🤍" : "Report sent. Thank you 🤍");
          }}
        />
      )}

      {/* Match modal */}
      {match && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-5 backdrop-blur-sm">
          <div className="animate-pop w-full max-w-sm rounded-[2rem] bg-cream p-8 text-center shadow-soft">
            <div className="flex items-center justify-center -space-x-4">
              <Avatar name={me.full_name} photoUrl={me.profile_photo_url} size="xl" />
              <Avatar name={match.full_name} photoUrl={match.profile_photo_url} size="xl" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold text-terracotta">
              It’s a match ✿
            </h2>
            <p className="mt-2 text-ink-soft">
              You and {firstName(match.full_name)} chose each other. Say hi — then find
              a trip you both love.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={messageMatch}
                className="w-full rounded-full bg-terracotta py-3 text-sm font-bold text-white hover:bg-terracotta-deep"
              >
                Send her a message
              </button>
              <Link
                href="/trips"
                className="block w-full rounded-full border border-sand-deep py-3 text-sm font-bold text-ink hover:bg-sand"
              >
                Find a trip together
              </Link>
              <button
                onClick={() => setMatch(null)}
                className="text-sm font-semibold text-ink-soft hover:text-ink"
              >
                Keep exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
