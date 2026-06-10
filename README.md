# TravelSister — by Nomara

A **women-only community app** for finding travel sisters: match with women who
share your practices — yoga, pilates, surf, breathwork, nervous system
regulation — and your dream destinations, then meet in real life on a
[Nomara](https://nomaratravel.com) trip.

The app is a top-of-funnel product for Nomara: every surface (landing page,
match moments, empty states, trip pages) routes members toward booking real
Nomara trips on nomaratravel.com with `utm_source=travelsister` tracking.

## How it works

1. **Join (women only)** — sign-up requires attesting you identify as a woman
   and agreeing to the community guidelines; both are timestamped on the
   profile (`women_attestation_accepted_at`, `guidelines_accepted_at`).
2. **Onboard** — interests, travel style, languages, dream destinations,
   profile prompts.
3. **Discover** — a card deck of other members, ranked by shared interests and
   destinations. *Connect* sends a request; if she already reached out, it's an
   instant match.
4. **Sisters & Messages** — mutual connections unlock 1:1 chat (realtime, with
   polling fallback). Messaging is impossible without a mutual match — enforced
   in the database, not just the UI.
5. **Trips** — real, upcoming Nomara trips seeded from the production catalog.
   Members can join a free "trip circle" (interest + group chat), and book on
   nomaratravel.com.
6. **Funnel leads** — the public landing page captures emails into
   `funnel_leads` for marketing.
7. **Report & block** — flag a profile from Discover, a sister's profile, or any
   chat. Blocking severs the friendship, hides both members from each other, and
   disables messaging in both directions (enforced in the database). Reports land
   in the admin queue.
8. **Admin dashboard** (`/admin`, admins only) — community stats, the member list
   with a one-tap verification toggle, funnel leads (with copy-all-emails), and
   the safety report queue.
9. **Photo uploads** — members upload profile photos to Supabase Storage
   (`avatars` bucket, 5 MB limit, locked to each member's own folder).

## Running it

```bash
npm install
npm run dev
```

That's it — the app ships with public Supabase config baked in
(`lib/supabase/config.ts`), overridable via `.env.local` (see `.env.example`).
The anon key is browser-safe by design; all access control lives in Postgres
Row Level Security.

### Demo accounts

Eight demo members exist so the app feels alive. All share the password
`NomaraDemo123!`:

| Email | Vibe |
| --- | --- |
| `maya@demo.travelsister.app` | Surf, yoga, breathwork — San Diego |
| `sofia@demo.travelsister.app` | Pilates, dance, cooking — Mexico City |
| `amara@demo.travelsister.app` | Nervous system regulation, somatics — Austin |
| `lena@demo.travelsister.app` | Cold plunge, running — Berlin |
| `priya@demo.travelsister.app` | Yoga, sound healing — NYC |
| `jess@demo.travelsister.app` | Hiking, pilates — Denver |
| `camille@demo.travelsister.app` | Surf, dance — Montreal |
| `noor@demo.travelsister.app` | Meditation, cooking — Chicago |

Tip: sign in as two demo users in two browsers and like each other to see the
match → message flow. Delete these accounts before a public launch.

## Architecture

- **Next.js 16** (App Router, Turbopack) + **Tailwind CSS v4**
- **Supabase** — project `nrntzqpcneukmlyqrjod` ("Nomara App"): auth, Postgres
  with RLS, realtime for chat
- No custom backend: pages talk to Supabase directly; all authorization is RLS
  plus two `SECURITY DEFINER` functions

### Tables used

| Table | Purpose |
| --- | --- |
| `users` | Member profiles (interests, prompts, attestations, verification) |
| `swipes` | Like/pass history (drives the Discover deck) |
| `friend_requests` | Connect requests; DB trigger creates friendships on accept |
| `friendships` | Reciprocal edges; gate for messaging |
| `conversations`, `conversation_participants`, `direct_messages` | 1:1 chat (created only via the friendship-gated `get_or_create_conversation` RPC) |
| `trips` | Nomara trip catalog shown in-app (booking links → nomaratravel.com) |
| `trip_members`, `messages` | Free "trip circles" with member-only group chat |
| `funnel_leads` | Landing-page email capture (anon can insert, only admins read) |
| `blocks` | Member blocks (symmetric hiding + message ban via `block_member` RPC) |
| `member_reports` | Safety reports; admin-only queue surfaced in `/admin` |
| `storage.avatars` | Profile photo bucket; public read, members write only their own folder |

### Women-only enforcement

- Sign-up and onboarding both require the women-only attestation (timestamped).
- `verification_status` (`pending` → `verified`) is managed from `/admin`;
  verified members get a badge. ("Not a woman" is the first report reason —
  those reports are the enforcement signal.)
- Community guidelines live at `/safety` and are agreed to at join time.
- In-app report & block on every profile and conversation; escalations go to
  `hello@nomaratravel.com` (see `lib/constants.ts`).

## Deploying (e.g. Vercel)

1. Push this repo and import it into Vercel — no env vars required (or set the
   two from `.env.example` explicitly).
2. In Supabase → Auth → URL Configuration, set **Site URL** to your deployed
   domain and add `https://your-domain/auth/callback` to the redirect list so
   email-confirmation links land correctly.
3. Optional: disable "Confirm email" in Supabase Auth for one-tap signup while
   testing; the app handles both modes.

## Admin notes

- Make yourself an admin (lets you read `funnel_leads` and manage trips):
  ```sql
  update public.users set is_admin = true where email = 'you@example.com';
  ```
- Trips shown in the app live in `public.trips` (Nomara App project) — keep
  `slug` equal to the trip slug on nomaratravel.com so booking links resolve.
- Funnel leads: `select * from public.funnel_leads order by created_at desc;`
