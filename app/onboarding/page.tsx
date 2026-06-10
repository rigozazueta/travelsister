"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Chip } from "@/components/Chip";
import { Logo } from "@/components/Logo";
import { PhotoUpload } from "@/components/PhotoUpload";
import {
  ACTIVITY_NAMES,
  LANGUAGE_OPTIONS,
  PROFILE_PROMPTS,
  SUGGESTED_DESTINATIONS,
  TRAVEL_FREQUENCIES,
  TRAVEL_STYLES,
} from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ageRangeFor, cn } from "@/lib/utils";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 0 — pledge
  const [isWoman, setIsWoman] = useState(false);
  const [agreesGuidelines, setAgreesGuidelines] = useState(false);

  // Step 1 — basics
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<string>("");
  const [location, setLocation] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);

  // Step 2 — vibe
  const [interests, setInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState("");
  const [frequency, setFrequency] = useState("");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [customDestination, setCustomDestination] = useState("");

  // Step 3 — story
  const [bio, setBio] = useState("");
  const [prompt1, setPrompt1] = useState(PROFILE_PROMPTS[0]);
  const [answer1, setAnswer1] = useState("");
  const [prompt2, setPrompt2] = useState(PROFILE_PROMPTS[3]);
  const [answer2, setAnswer2] = useState("");
  const [instagram, setInstagram] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/sign-in");
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? "");
      setFullName((user.user_metadata?.full_name as string) ?? "");

      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_complete")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.onboarding_complete) router.replace("/discover");
    });
  }, [supabase, router]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function addCustomDestination() {
    const value = customDestination.trim();
    if (value && !destinations.includes(value)) {
      setDestinations([...destinations, value]);
    }
    setCustomDestination("");
  }

  const stepValid = [
    isWoman && agreesGuidelines,
    fullName.trim().length > 1 && Number(age) >= 18 && location.trim().length > 1,
    interests.length >= 2 && !!travelStyle && !!frequency && destinations.length >= 1,
    bio.trim().length >= 20 && answer1.trim().length > 2,
  ][step];

  async function finish() {
    if (!userId) return;
    setSaving(true);
    setError(null);

    const prompts = [
      { question: prompt1, answer: answer1.trim() },
      ...(answer2.trim() ? [{ question: prompt2, answer: answer2.trim() }] : []),
    ];

    const { error: upsertError } = await supabase.from("users").upsert({
      id: userId,
      email,
      full_name: fullName.trim(),
      bio: bio.trim(),
      location: location.trim(),
      age: Number(age),
      age_range: ageRangeFor(Number(age)),
      interests,
      desired_destinations: destinations,
      prompts,
      travel_style: travelStyle,
      languages,
      travel_frequency: frequency,
      instagram_handle: instagram.trim().replace(/^@/, ""),
      profile_photo_url: photoUrl.trim(),
      onboarding_complete: true,
      women_attestation_accepted_at: new Date().toISOString(),
      guidelines_accepted_at: new Date().toISOString(),
    });

    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    router.push("/discover");
  }

  return (
    <div className="texture-grain min-h-screen">
      <header className="mx-auto flex max-w-xl items-center justify-between px-5 py-6">
        <Logo />
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">
          {step + 1} / {TOTAL_STEPS}
        </span>
      </header>

      <div className="mx-auto max-w-xl px-5">
        <div className="h-1.5 overflow-hidden rounded-full bg-sand">
          <div
            className="h-full rounded-full bg-terracotta transition-all duration-500"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <main className="mx-auto max-w-xl px-5 pb-24 pt-8">
        {step === 0 && (
          <section className="animate-rise space-y-6">
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink">
              First, the promise that makes
              <span className="italic text-terracotta"> all of this work.</span>
            </h1>
            <p className="leading-relaxed text-ink-soft">
              TravelSister is women only. It’s what lets a member say yes to a surf
              trip with someone she met here. Joining means making this promise to
              every other woman in the community.
            </p>
            <div className="space-y-3 rounded-3xl bg-white p-6 shadow-card">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isWoman}
                  onChange={(e) => setIsWoman(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-terracotta"
                />
                <span className="text-sm leading-relaxed text-ink">
                  I identify as a woman, and I’m joining to connect with other women.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreesGuidelines}
                  onChange={(e) => setAgreesGuidelines(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-terracotta"
                />
                <span className="text-sm leading-relaxed text-ink">
                  I’ve read and agree to the{" "}
                  <Link href="/safety" target="_blank" className="font-semibold text-terracotta hover:underline">
                    community guidelines
                  </Link>
                  , including kindness, honesty, and privacy.
                </span>
              </label>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="animate-rise space-y-5">
            <h1 className="font-display text-3xl font-semibold text-ink">The basics</h1>
            <label className="block">
              <span className="text-sm font-semibold text-ink">Your name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Maya Castillo"
                className="mt-1.5 w-full rounded-2xl border border-sand-deep bg-white px-4 py-3 outline-none focus:border-terracotta"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Age</span>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="29"
                  className="mt-1.5 w-full rounded-2xl border border-sand-deep bg-white px-4 py-3 outline-none focus:border-terracotta"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink">Home base</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Denver, CO"
                  className="mt-1.5 w-full rounded-2xl border border-sand-deep bg-white px-4 py-3 outline-none focus:border-terracotta"
                />
              </label>
            </div>
            <div>
              <span className="text-sm font-semibold text-ink">Languages you speak</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <Chip
                    key={lang}
                    label={lang}
                    selected={languages.includes(lang)}
                    onClick={() => toggle(languages, setLanguages, lang)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="animate-rise space-y-6">
            <h1 className="font-display text-3xl font-semibold text-ink">Your vibe</h1>
            <div>
              <span className="text-sm font-semibold text-ink">
                What do you love doing? <span className="text-ink-soft">(pick at least 2)</span>
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACTIVITY_NAMES.map((activity) => (
                  <Chip
                    key={activity}
                    label={activity}
                    selected={interests.includes(activity)}
                    onClick={() => toggle(interests, setInterests, activity)}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-ink">Your travel style</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {TRAVEL_STYLES.map((style) => (
                  <Chip
                    key={style}
                    label={style}
                    selected={travelStyle === style}
                    onClick={() => setTravelStyle(style)}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-ink">How often do you travel?</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {TRAVEL_FREQUENCIES.map((f) => (
                  <Chip
                    key={f}
                    label={f}
                    selected={frequency === f}
                    onClick={() => setFrequency(f)}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-ink">
                Dream destinations <span className="text-ink-soft">(pick at least 1)</span>
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {[...new Set([...SUGGESTED_DESTINATIONS, ...destinations])].map((dest) => (
                  <Chip
                    key={dest}
                    label={dest}
                    selected={destinations.includes(dest)}
                    onClick={() => toggle(destinations, setDestinations, dest)}
                  />
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomDestination();
                    }
                  }}
                  placeholder="Add your own…"
                  className="flex-1 rounded-2xl border border-sand-deep bg-white px-4 py-2.5 text-sm outline-none focus:border-terracotta"
                />
                <button
                  type="button"
                  onClick={addCustomDestination}
                  className="rounded-2xl bg-sand px-4 text-sm font-bold text-ink hover:bg-sand-deep"
                >
                  Add
                </button>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="animate-rise space-y-5">
            <h1 className="font-display text-3xl font-semibold text-ink">Your story</h1>
            <label className="block">
              <span className="text-sm font-semibold text-ink">
                Bio <span className="text-ink-soft">(at least 20 characters)</span>
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Yoga teacher who plans trips around farmers markets and sunrise hikes…"
                className="mt-1.5 w-full rounded-2xl border border-sand-deep bg-white px-4 py-3 outline-none focus:border-terracotta"
              />
            </label>
            <div className="space-y-2 rounded-2xl bg-white p-4 shadow-card">
              <select
                value={prompt1}
                onChange={(e) => setPrompt1(e.target.value)}
                className="w-full rounded-xl border border-sand-deep bg-cream px-3 py-2 text-sm font-semibold outline-none"
              >
                {PROFILE_PROMPTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                placeholder="Your answer…"
                className="w-full rounded-xl border border-sand-deep px-3 py-2 text-sm outline-none focus:border-terracotta"
              />
            </div>
            <div className="space-y-2 rounded-2xl bg-white p-4 shadow-card">
              <select
                value={prompt2}
                onChange={(e) => setPrompt2(e.target.value)}
                className="w-full rounded-xl border border-sand-deep bg-cream px-3 py-2 text-sm font-semibold outline-none"
              >
                {PROFILE_PROMPTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                placeholder="Optional second answer…"
                className="w-full rounded-xl border border-sand-deep px-3 py-2 text-sm outline-none focus:border-terracotta"
              />
            </div>
            <div>
              <span className="text-sm font-semibold text-ink">Profile photo (optional)</span>
              <div className="mt-2 rounded-2xl bg-white p-4 shadow-card">
                {userId && (
                  <PhotoUpload
                    userId={userId}
                    name={fullName}
                    value={photoUrl}
                    onChange={setPhotoUrl}
                  />
                )}
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-ink">Instagram (optional)</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@yourhandle"
                className="mt-1.5 w-full rounded-2xl border border-sand-deep bg-white px-4 py-3 outline-none focus:border-terracotta"
              />
            </label>
            <p className="text-xs text-ink-soft">
              No photo? No problem — you’ll get a beautiful initials avatar until you add one.
            </p>
          </section>
        )}

        {error && (
          <p className="mt-5 rounded-2xl bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta-deep">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={cn(
              "rounded-full px-5 py-3 text-sm font-bold text-ink-soft hover:bg-sand",
              step === 0 && "invisible"
            )}
          >
            ← Back
          </button>
          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              disabled={!stepValid}
              onClick={() => setStep((s) => s + 1)}
              className="rounded-full bg-terracotta px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-terracotta-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              disabled={!stepValid || saving}
              onClick={finish}
              className="rounded-full bg-terracotta px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-terracotta-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving…" : "Meet your sisters ✿"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
