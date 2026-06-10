"use client";

import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import type { Profile } from "@/lib/types";

export function ProfileModal({
  profile,
  onClose,
  onMessage,
  onReport,
}: {
  profile: Profile;
  onClose: () => void;
  onMessage?: () => void;
  onReport?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:px-5"
      onClick={onClose}
    >
      <div
        className="animate-pop max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-cream shadow-soft sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {profile.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profile_photo_url}
              alt={profile.full_name ?? "Member"}
              className="h-60 w-full object-cover sm:rounded-t-[2rem]"
            />
          ) : (
            <div className="flex h-60 w-full items-center justify-center bg-gradient-to-br from-blush to-sand sm:rounded-t-[2rem]">
              <Avatar name={profile.full_name} size="xl" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink/50 text-white backdrop-blur hover:bg-ink"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-6 pb-4 pt-14">
            <h2 className="font-display text-2xl font-semibold text-white">
              {profile.full_name}
              {profile.age ? `, ${profile.age}` : ""}
            </h2>
            <p className="text-sm font-medium text-white/85">{profile.location}</p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {profile.verification_status === "verified" && (
            <span className="inline-block rounded-full bg-sage px-3 py-1 text-xs font-bold text-white">
              ✓ Verified member
            </span>
          )}

          {profile.bio && <p className="leading-relaxed text-ink">{profile.bio}</p>}

          <div className="flex flex-wrap gap-2 text-xs font-bold text-ink-soft">
            {profile.travel_style && (
              <span className="rounded-full bg-sand px-3 py-1.5">{profile.travel_style}</span>
            )}
            {profile.travel_frequency && (
              <span className="rounded-full bg-sand px-3 py-1.5">{profile.travel_frequency}</span>
            )}
            {(profile.languages ?? []).length > 0 && (
              <span className="rounded-full bg-sand px-3 py-1.5">
                Speaks {(profile.languages ?? []).join(", ")}
              </span>
            )}
          </div>

          {(profile.interests ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(profile.interests ?? []).map((i) => (
                <Chip key={i} label={i} />
              ))}
            </div>
          )}

          {(profile.desired_destinations ?? []).length > 0 && (
            <p className="text-sm text-ink-soft">
              Dreaming of: <strong>{(profile.desired_destinations ?? []).join(" · ")}</strong>
            </p>
          )}

          {(profile.prompts ?? []).map((p) => (
            <blockquote key={p.question} className="rounded-2xl bg-white p-4 shadow-card">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-sage-deep">
                {p.question}
              </p>
              <p className="mt-1 font-display text-lg italic text-ink">“{p.answer}”</p>
            </blockquote>
          ))}

          {profile.instagram_handle && (
            <a
              href={`https://www.instagram.com/${profile.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-bold text-terracotta hover:underline"
            >
              @{profile.instagram_handle} ↗
            </a>
          )}

          <div className="flex items-center gap-2 pt-2">
            {onMessage && (
              <button
                onClick={onMessage}
                className="flex-1 rounded-full bg-terracotta py-3 text-sm font-bold text-white hover:bg-terracotta-deep"
              >
                💬 Message
              </button>
            )}
            {onReport && (
              <button
                onClick={onReport}
                className="rounded-full border border-sand-deep px-4 py-3 text-sm font-bold text-ink-soft hover:bg-sand"
                title="Report or block"
              >
                ⚑
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
