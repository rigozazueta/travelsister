"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { nomaraLink } from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile, Trip, TripMessage } from "@/lib/types";
import { cn, firstName, timeAgo } from "@/lib/utils";

export default function TripDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [meId, setMeId] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [joined, setJoined] = useState(false);
  const [chat, setChat] = useState<TripMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadCommunity = useCallback(
    async (tripId: string, userId: string) => {
      const { data: memberRows } = await supabase
        .from("trip_members")
        .select("user_id")
        .eq("trip_id", tripId);
      const ids = (memberRows ?? []).map((m) => m.user_id as string);
      setJoined(ids.includes(userId));
      if (ids.length > 0) {
        const { data: profiles } = await supabase.from("users").select("*").in("id", ids);
        setMembers((profiles ?? []) as Profile[]);
      } else {
        setMembers([]);
      }
    },
    [supabase]
  );

  const loadChat = useCallback(
    async (tripId: string) => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true })
        .limit(300);
      if (data) setChat(data as TripMessage[]);
    },
    [supabase]
  );

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setMeId(user.id);

      const { data: tripRow } = await supabase
        .from("trips")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (!tripRow) {
        setLoading(false);
        return;
      }
      const t = tripRow as Trip;
      setTrip(t);
      await loadCommunity(t.id, user.id);
      await loadChat(t.id);
      setLoading(false);

      channel = supabase
        .channel(`trip-${t.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `trip_id=eq.${t.id}` },
          (payload) => {
            const incoming = payload.new as TripMessage;
            setChat((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
          }
        )
        .subscribe();
      poll = setInterval(() => loadChat(t.id), 8000);
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (poll) clearInterval(poll);
    };
  }, [supabase, slug, loadCommunity, loadChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

  async function toggleJoin() {
    if (!trip || !meId) return;
    if (joined) {
      await supabase.from("trip_members").delete().eq("trip_id", trip.id).eq("user_id", meId);
    } else {
      await supabase.from("trip_members").insert({ trip_id: trip.id, user_id: meId });
    }
    await loadCommunity(trip.id, meId);
    await loadChat(trip.id);
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !trip || !meId) return;
    setDraft("");
    const { data, error } = await supabase
      .from("messages")
      .insert({ trip_id: trip.id, user_id: meId, content })
      .select()
      .single();
    if (!error && data) {
      setChat((prev) =>
        prev.some((m) => m.id === (data as TripMessage).id) ? prev : [...prev, data as TripMessage]
      );
    } else if (error) {
      setDraft(content);
    }
  }

  if (loading) {
    return <p className="py-24 text-center text-ink-soft">Loading trip…</p>;
  }

  if (!trip) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-2xl font-semibold text-ink">Trip not found</p>
        <Link href="/trips" className="mt-3 inline-block font-bold text-terracotta hover:underline">
          ← Back to trips
        </Link>
      </div>
    );
  }

  const memberById = new Map(members.map((m) => [m.id, m]));
  const bookUrl = nomaraLink(`/trips/${trip.slug}`, "trip-detail");

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/trips" className="text-sm font-bold text-ink-soft hover:text-ink">
        ← All trips
      </Link>

      {/* Hero */}
      <div className="relative mt-4 h-72 overflow-hidden rounded-[2rem] shadow-soft md:h-96">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trip.hero_image_url} alt={trip.name} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-7 pb-6 pt-24">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-blush">{trip.dates}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">
            {trip.name}
          </h1>
          <p className="mt-1 font-medium text-white/85">{trip.location}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">About this trip</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{trip.description}</p>
          </section>

          {trip.whats_included && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">What’s included</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">{trip.whats_included}</p>
            </section>
          )}

          {/* Trip circle chat */}
          <section className="rounded-3xl bg-white p-5 shadow-card">
            <h2 className="font-display text-xl font-semibold text-ink">Trip circle chat</h2>
            {joined ? (
              <>
                <div className="mt-3 max-h-80 space-y-2.5 overflow-y-auto pr-1">
                  {chat.length === 0 && (
                    <p className="py-6 text-center text-sm text-ink-soft">
                      It’s quiet in here — break the ice ✿
                    </p>
                  )}
                  {chat.map((m) => {
                    const sender = memberById.get(m.user_id);
                    const mine = m.user_id === meId;
                    return (
                      <div key={m.id} className={cn("flex gap-2.5", mine && "flex-row-reverse")}>
                        <Avatar
                          name={sender?.full_name ?? "Member"}
                          photoUrl={sender?.profile_photo_url}
                          size="sm"
                        />
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-card",
                            mine ? "rounded-tr-md bg-terracotta text-white" : "rounded-tl-md bg-cream text-ink"
                          )}
                        >
                          {!mine && (
                            <p className="text-[11px] font-bold text-sage-deep">
                              {firstName(sender?.full_name)} · {timeAgo(m.created_at)}
                            </p>
                          )}
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendChat} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Message the circle…"
                    className="flex-1 rounded-full border border-sand-deep bg-white px-4 py-2.5 text-sm outline-none focus:border-terracotta"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-bold text-white hover:bg-terracotta-deep disabled:opacity-40"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">
                Join the circle to chat with the women interested in this trip.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-3xl bg-white p-6 shadow-card">
            <p className="font-display text-3xl font-semibold text-ink">{trip.price}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {trip.spots_left} of {trip.spots_total} spots left
            </p>
            <a
              href={bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block rounded-full bg-terracotta py-3.5 text-center text-sm font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-terracotta-deep"
            >
              Book on nomaratravel.com ↗
            </a>
            <button
              onClick={toggleJoin}
              className={cn(
                "mt-3 w-full rounded-full border py-3 text-sm font-bold transition-colors",
                joined
                  ? "border-sage bg-sage/15 text-sage-deep hover:bg-sage/25"
                  : "border-ink/20 text-ink hover:bg-sand"
              )}
            >
              {joined ? "✓ In the circle — tap to leave" : "Join the trip circle (free)"}
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-soft">
              Joining the circle is free and just means “I’m interested.” Booking
              happens securely on Nomara.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-ink">
              {members.length > 0
                ? `${members.length} in the circle`
                : "No one in the circle yet"}
            </h3>
            {members.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <Avatar name={m.full_name} photoUrl={m.profile_photo_url} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">
                        {m.full_name}
                        {m.id === meId && " (you)"}
                      </p>
                      <p className="truncate text-xs text-ink-soft">{m.location}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">
                Be the first — your sisters will see you here.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
