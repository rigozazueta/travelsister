"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = supabaseBrowser();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setLoading(false);
      setError(
        signInError.message === "Email not confirmed"
          ? "Please confirm your email first — check your inbox for the link we sent."
          : signInError.message
      );
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_complete, is_admin")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.onboarding_complete) router.push("/discover");
    else if (profile?.is_admin) router.push("/admin");
    else router.push("/onboarding");
  }

  return (
    <div className="animate-rise">
      <h1 className="font-display text-[2rem] font-light tracking-[-0.01em] text-ink">Welcome back.</h1>
      <p className="mt-2 text-ink-soft">Your sisters have been busy.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-4 py-3 outline-none placeholder:text-ink-soft/50 focus:border-terracotta"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-4 py-3 outline-none placeholder:text-ink-soft/50 focus:border-terracotta"
          />
        </label>

        {error && (
          <p className="rounded-2xl bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta-deep">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-terracotta py-3.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-deep disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/sign-up" className="font-semibold text-terracotta hover:underline">
          Join free
        </Link>
      </p>
    </div>
  );
}
