import Link from "next/link";
import type { Trip } from "@/lib/types";

export function TripCard({
  trip,
  href,
  external,
}: {
  trip: Trip;
  /** Internal route (e.g. /trips/slug) or external booking link. */
  href: string;
  external?: boolean;
}) {
  const body = (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-soft">
      <div className="relative h-52 overflow-hidden bg-sand">
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
        {trip.spots_left <= 6 && (
          <span className="absolute right-3 top-3 rounded-full bg-terracotta px-3 py-1 text-xs font-bold text-white shadow">
            {trip.spots_left} spots left
          </span>
        )}
      </div>
      <div className="space-y-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-deep">
          {trip.dates}
        </p>
        <h3 className="font-display text-xl font-semibold leading-snug text-ink">
          {trip.name}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-soft">{trip.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-ink">{trip.price}</span>
          <span className="text-sm font-semibold text-terracotta group-hover:underline">
            {external ? "View on Nomara ↗" : "View trip →"}
          </span>
        </div>
      </div>
    </article>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }
  return <Link href={href}>{body}</Link>;
}
