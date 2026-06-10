import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TripCard } from "@/components/TripCard";
import { EmailCapture } from "@/components/marketing/EmailCapture";
import { ACTIVITIES, NOMARA_INSTAGRAM, NOMARA_URL, nomaraLink } from "@/lib/constants";
import { supabaseServer } from "@/lib/supabase/server";
import type { Trip } from "@/lib/types";

export const revalidate = 300;

const STEPS = [
  {
    title: "Create your profile",
    body: "Share how you travel — your practices, your pace, the places calling you. Every member pledges that she's a woman and signs our community guidelines.",
    emoji: "✿",
  },
  {
    title: "Match with travel sisters",
    body: "We surface women who share your interests — morning pilates, sunset surf, breathwork on the beach — and your dream destinations. Connect when it feels right.",
    emoji: "☼",
  },
  {
    title: "Meet on a Nomara trip",
    body: "Turn a match into a real adventure. Join a small-group Nomara trip together — flights of stairs in Tuscany, waves in Costa Rica, your people included.",
    emoji: "✈",
  },
];

const SAFETY_POINTS = [
  {
    title: "Women only, full stop",
    body: "Every member attests she is a woman when she joins and agrees to our community guidelines. Accounts that misrepresent themselves are removed.",
  },
  {
    title: "Connect on your terms",
    body: "Messaging only unlocks when two women choose each other. No unsolicited DMs, ever.",
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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-soft md:flex">
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#trips" className="hover:text-ink">Trips</a>
          <Link href="/safety" className="hover:text-ink">Safety</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink hover:bg-sand"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream transition-colors hover:bg-terracotta"
          >
            Join free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 md:pt-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="animate-rise space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-sand-deep bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sage-deep">
              A women-only travel community
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
              Never travel
              <br />
              <span className="italic text-terracotta">alone</span> again.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-ink-soft">
              TravelSister matches you with women who move like you do — yoga at
              sunrise, surf at golden hour, pilates, breathwork, and nervous
              system resets in beautiful places. Find her, then go.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/sign-up"
                className="rounded-full bg-terracotta px-7 py-3.5 text-sm font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-terracotta-deep"
              >
                Find your travel sisters
              </Link>
              <a
                href="#trips"
                className="text-sm font-bold text-ink underline-offset-4 hover:underline"
              >
                Browse women-friendly trips ↓
              </a>
            </div>
            <p className="text-xs text-ink-soft">
              Free to join · Women only · By the team at{" "}
              <a
                href={nomaraLink("/", "landing")}
                className="font-semibold text-terracotta hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Nomara
              </a>
            </p>
          </div>

          {/* Activity collage */}
          <div className="animate-rise grid grid-cols-2 gap-4 [animation-delay:120ms]">
            <div className="space-y-4">
              <div className="rounded-3xl bg-blush/60 p-6 shadow-card">
                <p className="text-3xl">🏄‍♀️</p>
                <p className="mt-3 font-display text-lg font-semibold text-ink">Surf sisters</p>
                <p className="text-sm text-ink-soft">Dawn patrol is better with company.</p>
              </div>
              <div className="rounded-3xl bg-sage/20 p-6 shadow-card">
                <p className="text-3xl">🌿</p>
                <p className="mt-3 font-display text-lg font-semibold text-ink">
                  Nervous system resets
                </p>
                <p className="text-sm text-ink-soft">
                  Breathwork, cold plunges, sound baths — co-regulation included.
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="rounded-3xl bg-gold/20 p-6 shadow-card">
                <p className="text-3xl">🧘‍♀️</p>
                <p className="mt-3 font-display text-lg font-semibold text-ink">Yoga & pilates</p>
                <p className="text-sm text-ink-soft">Mat space saved for you.</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-card">
                <p className="text-3xl">🌅</p>
                <p className="mt-3 font-display text-lg font-semibold text-ink">Real trips</p>
                <p className="text-sm text-ink-soft">
                  Hosted small-group adventures by Nomara.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity ribbon */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-2.5">
          {ACTIVITIES.map((a) => (
            <span
              key={a.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand-deep bg-white/80 px-4 py-2 text-sm font-semibold text-ink-soft"
            >
              <span>{a.emoji}</span> {a.name}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-center text-4xl font-semibold text-ink">
            Find her, <span className="italic text-terracotta">then go.</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-3xl bg-cream p-7 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-lg text-white">
                    {step.emoji}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid items-start gap-10 md:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="font-display text-4xl font-semibold leading-tight text-ink">
                Built by women,
                <br />
                <span className="italic text-sage-deep">for women.</span>
              </h2>
              <p className="mt-4 max-w-sm leading-relaxed text-ink-soft">
                Safety isn’t a feature here — it’s the foundation. Read our full{" "}
                <Link href="/safety" className="font-semibold text-terracotta hover:underline">
                  community guidelines
                </Link>
                .
              </p>
            </div>
            <div className="space-y-4">
              {SAFETY_POINTS.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-sand-deep bg-white/70 p-5"
                >
                  <h3 className="font-display text-lg font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured trips */}
      <section id="trips" className="bg-ink py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blush">
                Hosted by Nomara
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-cream">
                Trips with your name on them
              </h2>
              <p className="mt-2 max-w-lg text-cream/70">
                Small groups, real hosts, zero logistics on your plate. Match with a
                sister inside the app, then book the same trip together.
              </p>
            </div>
            <a
              href={nomaraLink("/", "landing-trips")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-cream/30 px-5 py-2.5 text-sm font-bold text-cream transition-colors hover:bg-cream hover:text-ink"
            >
              See all trips on Nomara ↗
            </a>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                external
                href={nomaraLink(`/trips/${trip.slug}`, "landing-trips")}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Email capture */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
            Not ready to join yet?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">
            Get the next women’s trip drops, retreat invites, and community updates
            from Nomara. No spam, just sunshine.
          </p>
          <div className="mt-7">
            <EmailCapture source="landing" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sand-deep bg-white/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 md:flex-row">
          <Logo />
          <nav className="flex flex-wrap items-center gap-6 text-sm font-semibold text-ink-soft">
            <Link href="/safety" className="hover:text-ink">Safety & guidelines</Link>
            <a
              href={nomaraLink("/", "footer")}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              nomaratravel.com ↗
            </a>
            <a
              href={NOMARA_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              Instagram ↗
            </a>
          </nav>
          <p className="text-xs text-ink-soft">
            © {new Date().getFullYear()} Nomara · {NOMARA_URL.replace("https://", "")}
          </p>
        </div>
      </footer>
    </div>
  );
}
