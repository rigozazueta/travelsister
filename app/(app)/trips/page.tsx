"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { nomaraLink } from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile, Trip } from "@/lib/types";

type TripWithCommunity = Trip & { memberCount: number; joined: boolean; matchesMyList: boolean };

export default function TripsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [trips, setTrips] = useState<TripWithCommunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: tripRows }, { data: members }, { data: meRow }] = await Promise.all([
        supabase.from("trips").select("*").eq("is_active", true).order("created_at"),
        supabase.from("trip_members").select("trip_id, user_id"),
        supabase.from("users").select("desired_destinations").eq("id", user.id).single(),
      ]);

      const me = meRow as Pick<Profile, "desired_destinations"> | null;
      const myDestinations = (me?.desired_destinations ?? []).map((d) => d.toLowerCase());

      const countByTrip = new Map<string, number>();
      const joinedTrips = new Set<string>();
      (members ?? []).forEach((m) => {
        countByTrip.set(m.trip_id as string, (countByTrip.get(m.trip_id as string) ?? 0) + 1);
        if (m.user_id === user.id) joinedTrips.add(m.trip_id as string);
      });

      setTrips(
        ((tripRows ?? []) as Trip[]).map((t) => ({
          ...t,
          memberCount: countByTrip.get(t.id) ?? 0,
          joined: joinedTrips.has(t.id),
          matchesMyList: myDestinations.some((d) => t.location.toLowerCase().includes(d)),
        }))
      );
      setLoading(false);
    })();
  }, [supabase]);

  if (loading) {
    return <p className="py-24 text-center text-ink-soft">Packing the itineraries…</p>;
  }

  const recommended = trips.filter((t) => t.matchesMyList);
  const rest = trips.filter((t) => !t.matchesMyList);

  function TripRow({ trip }: { trip: TripWithCommunity }) {
    return (
      <Link
        href={`/trips/${trip.slug}`}
        className="group overflow-hidden rounded-3xl bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
      >
        <div className="relative h-48 overflow-hidden bg-sand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trip.hero_image_url}
            alt={trip.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
          <p className="absolute bottom-3 left-4 text-sm font-semibold text-white drop-shadow">
            {trip.location}
          </p>
          {trip.joined && (
            <span className="absolute left-3 top-3 rounded-full bg-sage px-3 py-1 text-xs font-bold text-white">
              ✓ In this circle
            </span>
          )}
          {trip.spots_left <= 6 && (
            <span className="absolute right-3 top-3 rounded-full bg-terracotta px-3 py-1 text-xs font-bold text-white">
              {trip.spots_left} spots left
            </span>
          )}
        </div>
        <div className="space-y-1.5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-deep">
            {trip.dates}
          </p>
          <h3 className="font-display text-xl font-semibold leading-snug text-ink">
            {trip.name}
          </h3>
          <div className="flex items-center justify-between pt-1.5">
            <span className="text-sm font-bold text-ink">{trip.price}</span>
            <span className="text-xs font-semibold text-ink-soft">
              {trip.memberCount > 0
                ? `${trip.memberCount} sister${trip.memberCount === 1 ? "" : "s"} in the circle`
                : "Be the first in the circle"}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Trips</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            Real, hosted Nomara adventures. Join a trip circle to chat with the women
            going, then book your spot on nomaratravel.com.
          </p>
        </div>
        <a
          href={nomaraLink("/", "trips-tab")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-bold text-ink hover:bg-sand"
        >
          All trips on Nomara ↗
        </a>
      </div>

      {recommended.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-terracotta">
            Matching your dream destinations ✨
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((t) => (
              <TripRow key={t.id} trip={t} />
            ))}
          </div>
        </section>
      )}

      <section>
        {recommended.length > 0 && (
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">
            More adventures
          </h2>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((t) => (
            <TripRow key={t.id} trip={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
