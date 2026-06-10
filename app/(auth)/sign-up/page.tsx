"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isWoman, setIsWoman] = useState(false);
  const [agreesGuidelines, setAgreesGuidelines] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isWoman || !agreesGuidelines) {
      setError("TravelSister is a women-only community — both pledges are required to join.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabaseBrowser().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), app: "travelsister" },
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (!data.session) {
      // Email confirmation is enabled on the project.
      setNeedsConfirmation(true);
      return;
    }
    router.push("/onboarding");
  }

  if (needsConfirmation) {
    return (
      <div className="animate-pop rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-4xl">💌</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Check your inbox
        </h1>
        <p className="mt-2 text-ink-soft">
          We sent a confirmation link to <strong>{email}</strong>. Click it, then come
          back and sign in to build your profile.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-white hover:bg-terracotta-deep"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Join the sisterhood
      </h1>
      <p className="mt-2 text-ink-soft">
        Free forever. Two minutes to set up. Women only.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-ink">First & last name</span>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Maya Castillo"
            className="mt-1.5 w-full rounded-2xl border border-sand-deep bg-white px-4 py-3 outline-none placeholder:text-ink-soft/50 focus:border-terracotta"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-1.5 w-full rounded-2xl border border-sand-deep bg-white px-4 py-3 outline-none placeholder:text-ink-soft/50 focus:border-terracotta"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="mt-1.5 w-full rounded-2xl border border-sand-deep bg-white px-4 py-3 outline-none placeholder:text-ink-soft/50 focus:border-terracotta"
          />
        </label>

        <div className="space-y-3 rounded-2xl bg-blush/40 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isWoman}
              onChange={(e) => setIsWoman(e.target.checked)}
              className="mt-1 h-4 w-4 accent-terracotta"
            />
            <span className="text-sm leading-relaxed text-ink">
              I identify as a woman. I understand TravelSister is a women-only
              community and accounts that misrepresent themselves are removed.
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
              I agree to the{" "}
              <Link href="/safety" target="_blank" className="font-semibold text-terracotta hover:underline">
                community guidelines
              </Link>
              .
            </span>
          </label>
        </div>

        {error && (
          <p className="rounded-2xl bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta-deep">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-terracotta py-3.5 text-sm font-bold text-white transition-colors hover:bg-terracotta-deep disabled:opacity-60"
        >
          {loading ? "Creating your account…" : "Create my account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already a member?{" "}
        <Link href="/sign-in" className="font-bold text-terracotta hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
