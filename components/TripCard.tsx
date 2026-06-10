import Link from "next/link";
import type { Trip } from "@/lib/types";

export function TripCard({
  trip,
  href,
  external,
  tone = "light",
}: {
  trip: Trip;
  /** Internal route (e.g. /trips/slug) or external booking link. */
  href: string;
  external?: boolean;
  tone?: "light" | "dark";
}) {
  const onDark = tone === "dark";
  const body = (
    <article
      className={
        onDark
          ? "group overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all duration-300 hover:bg-white/[0.07] hover:ring-white/20"
          : "group overflow-hidden rounded-xl bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
      }
    >
      <div className="relative h-56 overflow-hidden bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.hero_image_url}
          alt={trip.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        <p className="absolute bottom-3.5 left-4 text-[13px] font-medium tracking-[0.02em] text-white/95">
          {trip.location}
        </p>
        {trip.spots_left <= 6 && (
          <span className="absolute right-3 top-3 rounded-md bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {trip.spots_left} spots left
          </span>
        )}
      </div>
      <div className="space-y-2.5 p-5">
        <p
          className={
            onDark
              ? "text-[10px] font-semibold uppercase tracking-[0.22em] text-gold"
              : "text-[10px] font-semibold uppercase tracking-[0.22em] text-terracotta"
          }
        >
          {trip.dates}
        </p>
        <h3
          className={
            onDark
              ? "font-display text-[1.35rem] font-medium leading-snug text-cream"
              : "font-display text-[1.35rem] font-medium leading-snug text-ink"
          }
        >
          {trip.name}
        </h3>
        <div
          className={
            onDark
              ? "flex items-center justify-between border-t border-white/10 pt-3"
              : "flex items-center justify-between border-t border-ink/8 pt-3"
          }
        >
          <span
            className={
              onDark
                ? "font-display text-base font-medium text-cream"
                : "font-display text-base font-medium text-ink"
            }
          >
            {trip.price}
          </span>
          <span
            className={
              onDark
                ? "text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/60 transition-colors group-hover:text-cream"
                : "text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft transition-colors group-hover:text-terracotta"
            }
          >
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
