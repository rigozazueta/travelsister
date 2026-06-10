export const APP_NAME = "TravelSister";
export const NOMARA_URL = "https://nomaratravel.com";
export const NOMARA_INSTAGRAM = "https://www.instagram.com/nomara.travel/";
export const SAFETY_EMAIL = "hello@nomaratravel.com";

export function nomaraLink(path = "", campaign = "app") {
  const url = new URL(path, NOMARA_URL);
  url.searchParams.set("utm_source", "travelsister");
  url.searchParams.set("utm_medium", "app");
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

export const ACTIVITIES = [
  { name: "Yoga", emoji: "🧘‍♀️" },
  { name: "Pilates", emoji: "🩰" },
  { name: "Surfing", emoji: "🏄‍♀️" },
  { name: "Nervous System Regulation", emoji: "🌿" },
  { name: "Breathwork", emoji: "🌬️" },
  { name: "Meditation", emoji: "🕊️" },
  { name: "Cold Plunge", emoji: "🧊" },
  { name: "Sound Healing", emoji: "🔔" },
  { name: "Hiking", emoji: "⛰️" },
  { name: "Running", emoji: "👟" },
  { name: "Dance", emoji: "💃" },
  { name: "Cooking", emoji: "🍋" },
] as const;

export const ACTIVITY_NAMES = ACTIVITIES.map((a) => a.name);

export const TRAVEL_STYLES = [
  "Slow & soulful",
  "Wellness-first",
  "Adventure-packed",
  "Culture & food",
  "Mix of everything",
];

export const TRAVEL_FREQUENCIES = [
  "Every chance I get",
  "A few times a year",
  "Once a year",
  "Just getting started",
];

export const SUGGESTED_DESTINATIONS = [
  "Costa Rica",
  "Bali",
  "Portugal",
  "Italy",
  "Japan",
  "Mexico",
  "Colombia",
  "Morocco",
  "Greece",
  "Nicaragua",
  "Spain",
  "Peru",
];

export const PROFILE_PROMPTS = [
  "My nervous system resets when…",
  "Dream travel morning:",
  "You'll find me at…",
  "I'm looking for a travel sister who…",
  "The trip that changed me:",
];

export const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "Portuguese",
  "German",
  "Italian",
  "Arabic",
  "Hindi",
  "Mandarin",
  "Japanese",
];
