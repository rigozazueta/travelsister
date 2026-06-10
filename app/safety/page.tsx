import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SAFETY_EMAIL } from "@/lib/constants";

export const metadata = { title: "Safety & Community Guidelines" };

const GUIDELINES = [
  {
    title: "This space is for women",
    body: "TravelSister is a community for women finding women to travel with. When you join, you attest that you identify as a woman. Accounts that misrepresent their identity are removed without warning. This is the one rule we will never bend.",
  },
  {
    title: "Consent shapes every connection",
    body: "Messaging unlocks only when two members choose each other. A pass is final and never visible to the other person. Nobody can cold-DM you, and you can stop any conversation at any time.",
  },
  {
    title: "Show up as yourself",
    body: "Use your real first name, recent photos, and honest details. Authenticity is what makes meeting a stranger on the other side of the world feel safe.",
  },
  {
    title: "Kindness is the baseline",
    body: "No harassment, hate speech, body commentary, MLM pitches, or unsolicited selling. We are here to regulate nervous systems, not test them.",
  },
  {
    title: "Protect each other's privacy",
    body: "What a sister shares with you stays with you. Never share another member's photos, plans, or personal details outside the app.",
  },
  {
    title: "Meet smart",
    body: "First meetups happen in public places. Share your plans with someone you trust. On Nomara trips, our hosts are present from day one — you are never on your own unless you want to be.",
  },
];

export default function SafetyPage() {
  return (
    <div className="texture-grain min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Logo />
        <Link
          href="/sign-up"
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta"
        >
          Join free
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep">
          Safety & community guidelines
        </p>
        <h1 className="mt-3 font-display text-4xl font-light leading-tight text-ink md:text-5xl">
          The promises we make
          <span className="italic text-terracotta"> to each other.</span>
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
          TravelSister exists so women can find each other, feel safe, and see the
          world together. These guidelines are part of joining — every member agrees
          to them during sign-up.
        </p>

        <div className="mt-10 space-y-5">
          {GUIDELINES.map((g, i) => (
            <section key={g.title} className="rounded-xl bg-white/80 p-6 shadow-card">
              <h2 className="font-display text-xl font-medium text-ink">
                {i + 1}. {g.title}
              </h2>
              <p className="mt-2 leading-relaxed text-ink-soft">{g.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-xl bg-blush/50 p-6">
          <h2 className="font-display text-xl font-medium text-ink">
            See something? Tell us.
          </h2>
          <p className="mt-2 leading-relaxed text-ink-soft">
            If anyone makes you feel unsafe — in the app or on a trip — email{" "}
            <a href={`mailto:${SAFETY_EMAIL}`} className="font-semibold text-terracotta hover:underline">
              {SAFETY_EMAIL}
            </a>{" "}
            with the member’s name and what happened. A human from the Nomara team
            reads every report, and reporters stay anonymous.
          </p>
        </section>
      </main>
    </div>
  );
}
