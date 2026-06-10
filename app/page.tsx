import Link from "next/link";
import { Flower2, Leaf, Waves, Wind } from "lucide-react";
import { Logo } from "@/components/Logo";
import { TripCard } from "@/components/TripCard";
import { EmailCapture } from "@/components/marketing/EmailCapture";
import { ACTIVITIES, NOMARA_INSTAGRAM, NOMARA_URL, nomaraLink } from "@/lib/constants";
import { supabaseServer } from "@/lib/supabase/server";
import type { Trip } from "@/lib/types";

export const revalidate = 300;

const PRACTICES = [
  { Icon: Waves, name: "Surf", note: "Dawn patrol, better with company" },
  { Icon: Flower2, name: "Yoga & Pilates", note: "Mat space saved for you" },
  { Icon: Wind, name: "Breathwork", note: "Exhale somewhere beautiful" },
  { Icon: Leaf, name: "Nervous system resets", note: "Cold water, sound baths, stillness" },
];

const STEPS = [
  {
    title: "Create your profile",
    body: "Share how you travel — your practices, your pace, the places calling you. Every member pledges that she's a woman and signs our community guidelines.",
  },
  {
    title: "Match with travel sisters",
    body: "We surface women who share your interests and your dream destinations — morning pilates, sunset surf, breathwork on the beach. Connect when it feels right.",
  },
  {
    title: "Meet on a Nomara trip",
    body: "Turn a match into a real adventure. Join a small-group, hosted Nomara trip together — logistics handled, your people included.",
  },
];

const SAFETY_POINTS = [
  {
    title: "Women only, full stop",
    body: "Every member attests she is a woman when she joins and agrees to our community guidelines. Accounts that misrepresent themselves are removed.",
  },
  {
    title: "Connect on your terms",
    body: "Messaging only unlocks when two women choose each other. No unsolicited messages, ever.",
  },
  {
    title: "Hosted, not random",
    body: "TravelSister is run by Nomara, a real travel company with hosts on every trip — not an anonymous forum.",
  },
];

export default async function LandingPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("trips")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(6);
  const trips = (data ?? []) as Trip[];

  return (
    <div className="texture-grain">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden items-center gap-9 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-soft md:flex">
          <a href="#how" className="transition-colors hover:text-ink">How it works</a>
          <a href="#trips" className="transition-colors hover:text-ink">Trips</a>
          <Link href="/safety" className="transition-colors hover:text-ink">Safety</Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link
            href="/sign-in"
            className="px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:text-terracotta"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-ink px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-terracotta-deep"
          >
            Join free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-14 md:pt-20">
        <div className="grid items-center gap-14 md:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-rise space-y-8">
            <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
              <span className="h-px w-10 bg-sage-deep/50" />
              A women-only travel community
            </p>
            <h1 className="font-display text-[3.4rem] font-light leading-[1.02] tracking-[-0.02em] text-ink md:text-[4.6rem]">
              Never travel
              <br />
              <span className="font-normal italic text-terracotta">alone</span> again.
            </h1>
            <p className="max-w-md text-[1.05rem] leading-[1.75] text-ink-soft">
              TravelSister matches you with women who move like you do — yoga at
              sunrise, surf at golden hour, breathwork and slow mornings in
              beautiful places. Find her, then go.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Link
                href="/sign-up"
                className="rounded-lg bg-terracotta px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-terracotta-deep"
              >
                Find your travel sisters
              </Link>
              <a
                href="#trips"
                className="border-b border-ink/30 pb-0.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-terracotta hover:text-terracotta"
              >
                Browse the trips
              </a>
            </div>
            <p className="text-[12px] tracking-[0.02em] text-ink-soft">
              Free to join · Women only · By the team at{" "}
              <a
                href={nomaraLink("/", "landing")}
                className="font-semibold text-terracotta underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Nomara
              </a>
            </p>
          </div>

          {/* Arch composition */}
          <div className="animate-rise relative mx-auto w-full max-w-[420px] [animation-delay:150ms]">
            <div className="relative overflow-hidden rounded-t-[999px] rounded-b-2xl bg-gradient-to-b from-[#e8c9b2] via-[#cb8f6b] to-[#5f6b58] pb-[118%] shadow-soft">
              {/* sun */}
              <div className="absolute left-1/2 top-[16%] h-24 w-24 -translate-x-1/2 rounded-full bg-cream/85 blur-[1px]" />
              {/* horizon lines */}
              <svg
                className="absolute inset-x-0 bottom-0 h-[55%] w-full text-cream/35"
                viewBox="0 0 400 260"
                fill="none"
                preserveAspectRatio="none"
              >
                <path d="M0 40 Q 100 18 200 40 T 400 40" stroke="currentColor" strokeWidth="1.4" />
                <path d="M0 90 Q 100 66 200 90 T 400 90" stroke="currentColor" strokeWidth="1.4" />
                <path d="M0 140 Q 100 114 200 140 T 400 140" stroke="currentColor" strokeWidth="1.4" />
                <path d="M0 190 Q 100 162 200 190 T 400 190" stroke="currentColor" strokeWidth="1.4" />
                <path d="M0 240 Q 100 210 200 240 T 400 240" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </div>
            <figcaption className="absolute -left-4 bottom-10 hidden w-56 rounded-xl bg-cream/95 p-5 shadow-soft ring-1 ring-ink/5 backdrop-blur sm:block">
              <p className="font-display text-[1.05rem] italic leading-snug text-ink">
                “Found my surf sister in March. Tamarindo in December.”
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                The whole idea
              </p>
            </figcaption>
          </div>
        </div>

        {/* Practices index */}
        <div className="mt-24 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-ink/8 ring-1 ring-ink/8 lg:grid-cols-4">
          {PRACTICES.map((p) => (
            <div key={p.name} className="bg-cream px-6 py-7">
              <p.Icon className="h-5 w-5 text-terracotta" strokeWidth={1.5} />
              <p className="mt-4 font-display text-lg font-medium text-ink">{p.name}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{p.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-ink-soft/80">
          {ACTIVITIES.map((a) => a.name).join("  ·  ")}
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-ink/8 bg-white/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-center text-4xl font-light tracking-[-0.01em] text-ink md:text-5xl">
            Find her, <span className="italic text-terracotta">then go.</span>
          </h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="border-t border-ink/15 pt-6">
                <p className="font-display text-sm italic text-terracotta">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-2xl font-medium text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.8] text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 md:grid-cols-[1fr_1.2fr]">
            <div className="md:sticky md:top-10">
              <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
                <span className="h-px w-10 bg-sage-deep/50" />
                Safety is the foundation
              </p>
              <h2 className="mt-6 font-display text-4xl font-light leading-[1.1] text-ink md:text-5xl">
                Built by women,
                <br />
                <span className="italic text-sage-deep">for women.</span>
              </h2>
              <p className="mt-6 max-w-sm text-[15px] leading-[1.8] text-ink-soft">
                Read our full{" "}
                <Link
                  href="/safety"
                  className="font-semibold text-terracotta underline-offset-4 hover:underline"
                >
                  community guidelines
                </Link>{" "}
                — every member agrees to them before she joins.
              </p>
            </div>
            <div>
              {SAFETY_POINTS.map((p, i) => (
                <div
                  key={p.title}
                  className={
                    i === 0 ? "py-7" : "border-t border-ink/10 py-7"
                  }
                >
                  <h3 className="font-display text-xl font-medium text-ink">{p.title}</h3>
                  <p className="mt-2 max-w-lg text-[15px] leading-[1.8] text-ink-soft">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured trips */}
      <section id="trips" className="bg-pine py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
                <span className="h-px w-10 bg-gold/50" />
                Hosted by Nomara
              </p>
              <h2 className="mt-5 font-display text-4xl font-light text-cream md:text-5xl">
                Trips with your <span className="italic">name on them.</span>
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-[1.8] text-cream/60">
                Small groups, real hosts, zero logistics on your plate. Match with a
                sister inside the app, then book the same trip together.
              </p>
            </div>
            <a
              href={nomaraLink("/", "landing-trips")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-cream/25 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-cream hover:text-ink"
            >
              All trips on Nomara ↗
            </a>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                external
                tone="dark"
                href={nomaraLink(`/trips/${trip.slug}`, "landing-trips")}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Email capture */}
      <section className="py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-light text-ink md:text-4xl">
            Not ready to join <span className="italic">yet?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.8] text-ink-soft">
            Get the next women’s trip drops, retreat invites, and community updates
            from Nomara. No spam, just sunshine.
          </p>
          <div className="mt-9">
            <EmailCapture source="landing" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/8 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <Logo />
          <nav className="flex flex-wrap items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            <Link href="/safety" className="transition-colors hover:text-ink">
              Safety & guidelines
            </Link>
            <a
              href={nomaraLink("/", "footer")}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              nomaratravel.com ↗
            </a>
            <a
              href={NOMARA_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              Instagram ↗
            </a>
          </nav>
          <p className="text-[11px] tracking-[0.04em] text-ink-soft">
            © {new Date().getFullYear()} Nomara · {NOMARA_URL.replace("https://", "")}
          </p>
        </div>
      </footer>
    </div>
  );
}
