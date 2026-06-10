// Public Supabase config for the Nomara App project.
// The anon key is a publishable key: it ships to every browser by design and
// all data access is enforced by Row Level Security. Env vars override these
// so the app can be pointed at a different project without code changes.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nrntzqpcneukmlyqrjod.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybnR6cXBjbmV1a21seXFyam9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTk5NjgsImV4cCI6MjA4NjQzNTk2OH0.N8uV9_aUrH2_G7bknA3h18PwE5nJOmQARoXhp4z-Id8";
