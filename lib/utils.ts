import type { Profile } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const AVATAR_PALETTES = [
  "from-[#c2664a] to-[#e9c8b6]",
  "from-[#7e8f7c] to-[#c9d6c4]",
  "from-[#c9a35c] to-[#ecdcb8]",
  "from-[#9c6b8f] to-[#dcc3d5]",
  "from-[#5f7060] to-[#a9bca6]",
  "from-[#b3654d] to-[#e5c1a8]",
];

export function avatarPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
}

export function initials(name: string | null | undefined) {
  if (!name) return "✿";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function firstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] ?? "Sister";
}

export function sharedInterests(a: Profile, b: Profile) {
  const mine = new Set((a.interests ?? []).map((i) => i.toLowerCase()));
  return (b.interests ?? []).filter((i) => mine.has(i.toLowerCase()));
}

export function sharedDestinations(a: Profile, b: Profile) {
  const mine = new Set((a.desired_destinations ?? []).map((d) => d.toLowerCase()));
  return (b.desired_destinations ?? []).filter((d) => mine.has(d.toLowerCase()));
}

export function ageRangeFor(age: number) {
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  return "55+";
}

export function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
