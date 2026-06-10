"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import {
  ACTIVITY_NAMES,
  SAFETY_EMAIL,
  TRAVEL_FREQUENCIES,
  TRAVEL_STYLES,
} from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
      setProfile(data as Profile);
    })();
  }, [supabase]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  }

  function toggleList(key: "interests" | "desired_destinations", value: string) {
    if (!profile) return;
    const list = profile[key] ?? [];
    update(
      key,
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    await supabase
      .from("users")
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        location: profile.location,
        interests: profile.interests,
        desired_destinations: profile.desired_destinations,
        travel_style: profile.travel_style,
        travel_frequency: profile.travel_frequency,
        instagram_handle: profile.instagram_handle,
        profile_photo_url: profile.profile_photo_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2500);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!profile) {
    return <p className="py-24 text-center text-ink-soft">Loading your profile…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header card */}
      <div className="flex flex-wrap items-center gap-5 rounded-[2rem] bg-white p-6 shadow-card">
        <Avatar name={profile.full_name} photoUrl={profile.profile_photo_url} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {profile.full_name}
            {profile.age ? `, ${profile.age}` : ""}
          </h1>
          <p className="text-sm text-ink-soft">{profile.location}</p>
          <span
            className={
              profile.verification_status === "verified"
                ? "mt-2 inline-block rounded-full bg-sage px-3 py-1 text-xs font-bold text-white"
                : "mt-2 inline-block rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink-soft"
            }
          >
            {profile.verification_status === "verified"
              ? "✓ Verified member"
              : "Verification pending"}
          </span>
        </div>
        <button
          onClick={signOut}
          className="rounded-full border border-sand-deep px-4 py-2 text-sm font-bold text-ink-soft hover:bg-sand"
        >
          Sign out
        </button>
      </div>

      {/* Edit form */}
      <section className="space-y-5 rounded-[2rem] bg-white p-6 shadow-card">
        <h2 className="font-display text-xl font-semibold text-ink">Edit profile</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Name</span>
            <input
              type="text"
              value={profile.full_name ?? ""}
              onChange={(e) => update("full_name", e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-sand-deep px-4 py-3 outline-none focus:border-terracotta"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Home base</span>
            <input
              type="text"
              value={profile.location ?? ""}
              onChange={(e) => update("location", e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-sand-deep px-4 py-3 outline-none focus:border-terracotta"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-ink">Bio</span>
          <textarea
            rows={3}
            value={profile.bio ?? ""}
            onChange={(e) => update("bio", e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-sand-deep px-4 py-3 outline-none focus:border-terracotta"
          />
        </label>

        <div>
          <span className="text-sm font-semibold text-ink">Interests</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...new Set([...ACTIVITY_NAMES, ...(profile.interests ?? [])])].map((a) => (
              <Chip
                key={a}
                label={a}
                selected={(profile.interests ?? []).includes(a)}
                onClick={() => toggleList("interests", a)}
              />
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold text-ink">Travel style</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={profile.travel_style === s}
                onClick={() => update("travel_style", s)}
              />
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold text-ink">Travel frequency</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {TRAVEL_FREQUENCIES.map((f) => (
              <Chip
                key={f}
                label={f}
                selected={profile.travel_frequency === f}
                onClick={() => update("travel_frequency", f)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Instagram</span>
            <input
              type="text"
              value={profile.instagram_handle ?? ""}
              onChange={(e) => update("instagram_handle", e.target.value)}
              placeholder="yourhandle"
              className="mt-1.5 w-full rounded-2xl border border-sand-deep px-4 py-3 outline-none focus:border-terracotta"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Photo URL</span>
            <input
              type="url"
              value={profile.profile_photo_url ?? ""}
              onChange={(e) => update("profile_photo_url", e.target.value)}
              placeholder="https://…"
              className="mt-1.5 w-full rounded-2xl border border-sand-deep px-4 py-3 outline-none focus:border-terracotta"
            />
          </label>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-full bg-terracotta py-3.5 text-sm font-bold text-white hover:bg-terracotta-deep disabled:opacity-60"
        >
          {saving ? "Saving…" : savedAt ? "Saved ✓" : "Save changes"}
        </button>
      </section>

      {/* Safety footer */}
      <section className="rounded-[2rem] bg-blush/40 p-6 text-center text-sm text-ink-soft">
        <p>
          Questions or safety concerns? Email{" "}
          <a href={`mailto:${SAFETY_EMAIL}`} className="font-bold text-terracotta hover:underline">
            {SAFETY_EMAIL}
          </a>{" "}
          · Read the{" "}
          <Link href="/safety" className="font-bold text-terracotta hover:underline">
            community guidelines
          </Link>
        </p>
        <p className="mt-2 text-xs">
          TravelSister is a community by{" "}
          <a
            href="https://nomaratravel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-terracotta hover:underline"
          >
            Nomara
          </a>
          .
        </p>
      </section>
    </div>
  );
}
