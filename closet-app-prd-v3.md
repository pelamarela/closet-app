# Closet App — Product Requirements Document
**v3 · August 2026 · Single user: Špela**

---

## Overview

A personal wardrobe manager that helps you catalogue what you own, track what you wear, and get dressed better — with AI suggestions grounded in real weather, your actual wardrobe, and your personal style.

Single-user, mobile-first web app. No social features, no marketplace, no subscriptions.

This is a snapshot of the app as it exists today, superseding v2.1. Everything described below is built and live.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, TypeScript |
| Hosting | Vercel (GitHub auto-deploy from `claude/magical-newton-GpRpx`) |
| Database + Storage + Auth | Supabase (Postgres + object storage, RLS on every table) |
| Weather | Open-Meteo API (no key required) |
| AI | Anthropic Claude (server-side only, via Vercel serverless functions, auth-gated) |
| Live URL | closet.pelamarela.com |

---

## Data model

| Table | Purpose |
|---|---|
| `items` | Wardrobe catalogue. Fields: name, category (`top`/`bottom`/`one-piece`/`outerwear`/`shoes`/`accessory`/`fragrance`), subcategory, color, pattern, material, warmth (1–5), formality (1–5), sport (bool), brand, image_url, status (active/archived) |
| `outfits` | Logged outfit wears. Fields: date_worn, occasion, weather snapshot (jsonb), rating (1–5), image_url, notes |
| `outfit_items` | Join table: outfits ↔ items |
| `outfit_ideas` | AI-suggested outfits saved for later. Fields: occasion, reasoning, notes |
| `idea_items` | Join table: outfit_ideas ↔ items |
| `style_profile` | Single row per user. Free-text style description + `color_season`, fed into AI prompts (color_season used by Shop only) |
| `suggestion_feedback` | Thumbs up/down on AI suggestions, per occasion + item set. Used to steer future suggestions away from repeats |
| `constants` | Pieces always worn regardless of outfit (jewelry, watch, glasses) — description + optional photo, no category/warmth/formality. Kept out of the closet grid and suggestion logic entirely |

All tables have RLS enabled with `auth.uid() = user_id` (or ownership-via-join) policies. Storage bucket `item-photos` is private, folder-scoped per user (`{user_id}/...`), reused by items, outfit photos, and constants photos.

---

## Features

### 1. Wardrobe catalogue (Items tab)

- Split into tiers for browsing: **main** (tops/bottoms/one-pieces/outerwear), **shoes**, **accessories**, **fragrances** — each its own sticky-headed section so a scroll through one tier doesn't bury the others
- Statistics view ranks each tier by wear count independently (main pieces don't crowd out fragrances or vice versa); main tier shows top 12, other tiers top 6, in a 6-column grid on the main tier and an auto-fit grid elsewhere
- Select mode: multi-select for bulk archive or delete
- Bulletproof square (1:1) thumbnails across all grids regardless of source photo aspect ratio
- Empty state prompts to add first item

**Add item flow:**
- Tap "Add item" → OS file picker opens immediately
- 1 photo → Item form (AI pre-fills category, colour, brand, material, warmth, formality from the image)
- 2+ photos → Batch upload wizard (AI analyses each photo; review and save all at once; duplicate-item detection against existing wardrobe)
- Image compression client-side: ~300 KB max, 1200px, JPEG 0.8

**Item detail:**
- Hero image, all metadata fields
- Wear count and last worn date
- Edit or archive from detail view

**Archived items:**
- Separate page under Settings
- Restore to active or permanently delete

**Constants:**
- Separate page under Settings > Wardrobe — jewelry/watch/etc. you always wear, tracked outside the outfit-composition logic

---

### 2. Outfit log (Outfits tab)

- Log a real outfit: select items worn, set occasion, date, optional rating (1–5) and notes
- Pre-populate from a saved idea or from an AI suggestion
- Outfit library: chronological list with wear counts per item, rank-number styling shared with the calendar date block for visual consistency
- Outfit detail: collage of items (fragrance shown separately from the garment/shoe collage and pieces list), weather at time of wear, notes, rating
- Edit or delete any logged outfit
- Statistics: latest season shown first, most-worn items split by the same main/shoes/accessory/fragrance tiers as the Items tab, top 5 most-repeated outfit combinations (judged by core pieces — top/bottom/one-piece/shoes — so a different accessory or fragrance doesn't split an otherwise-identical combo)

---

### 3. AI Suggest

**Input (the brief):**
- Occasion (pick from history-based presets or type custom)
- Anchor item (optional): select one item to build the outfit around
- Weather: auto-fetched from Open-Meteo using device location
- Formality: learned per-user from outfit history, picker matches the item form's 1–5 rating style

**Output:**
- Always 3 outfit suggestions (unless the wardrobe genuinely can't support 3), each with item thumbnails, reasoning, and pieces list
- Option tabs to switch between suggestions
- Thumbs up/down feedback stored per suggestion
- Regenerate: excludes previously shown core items (top/bottom/one-piece/shoes — not accessories) to force real variety
- Save as idea or log directly as a worn outfit
- Bouncing-dots loading state with rotating flavor text while the AI call is in flight

**AI logic (server-side, `api/suggest.ts`):**
- Filters wardrobe by warmth range (based on temp) and formality range (based on occasion)
- If anchor item is set, it is included in every suggestion regardless of filters
- Sends style profile, outfit history, and feedback history to Claude
- Validates returned outfits: must have exactly 1 pair of shoes, valid base (top+bottom or one-piece), no duplicates
- Model: Claude Haiku (fast, cheap, sufficient for structured output)
- Requires an authenticated Supabase session (Bearer token verified server-side) — closes the earlier gap where anyone with the URL could burn API budget

---

### 4. Ideas

- Saved AI suggestions (or manually created outfit combinations)
- Moved out of the bottom nav into Settings > Wardrobe (freed up nav space for more frequently used tabs)
- Ideas list with occasion label and item collage preview
- Idea detail: full item list, AI reasoning, option to log as outfit
- Edit: change occasion, notes, swap items
- Delete

---

### 5. Shop

- Paste a product URL or describe an item you're considering buying
- Upload an optional photo
- AI analyses fit against your existing wardrobe: colour harmony (using style profile's `color_season`), style alignment, gap-filling, formality fit
- Returns a match percentage and honest written reasoning
- Serverless function: `api/analyze-purchase.ts` (Claude Sonnet)

---

### 6. Style profile

- Free-text description of personal style (up to 1000 chars) + color season
- Fed verbatim into every AI suggestion and shop analysis prompt (color season used by Shop only, not Suggest)
- Write manually or generate automatically from outfit history (requires 5+ logged outfits)
- Accessible from Settings, with a collapsible preview and save/fetch failures surfaced (not silent)

---

### 7. Account & auth

- Magic-link and email/password sign-up (with confirm-password field), Supabase Auth
- In-app password change, including Supabase's native `current_password` re-auth flow (no manual re-login round-trip)
- **Not yet built:** account deletion. Full plan is agreed (double-gate confirmation: password + typed "DELETE", wipes Storage objects then calls a service-role `api/delete-account.ts` to cascade-delete the Auth user) but deferred — blocked on adding `SUPABASE_SERVICE_ROLE_KEY` to Vercel.

---

## AI functions (serverless, Vercel)

| Endpoint | Model | Purpose | Auth |
|---|---|---|---|
| `api/suggest` | Claude Haiku | Generate 3 outfit suggestions | Required |
| `api/analyze-item` | Claude Haiku | Pre-fill item form from photo | Required |
| `api/analyze-purchase` | Claude Sonnet | Shop match score + reasoning | Required |
| `api/generate-profile` | Claude Sonnet | Generate style profile from outfit history | Required |

**Security:** Anthropic API key is server-side only, never exposed to the client. All 4 routes verify a Supabase Bearer token (`requireUser()`) before spending API budget; the frontend attaches it via a shared `apiFetch` helper.

---

## Design principles

- Mobile-first, works on desktop with fixed-position two-column layouts (Suggest, Calendar/Outfits, Log outfit) anchored to `TOPBAR_H` / `--nav-h` — every grid-item column needs `minHeight: 0` set directly on itself, or its content silently inflates the row past the container's real height (a CSS grid auto-min-size quirk, not obvious from a screenshot)
- Monochrome palette with a single warm accent (`#9C5544`)
- Typography: monospace for metadata/labels, UI sans for body and headings
- No loading skeletons — spinners/bouncing-dots only; errors always surfaced visibly, never silent
- Image compression before upload: client-side, keeps Supabase storage lean
- All CTA buttons route through the shared `UButton` component — never hand-rolled

---

## Constraints & limits

- Free tiers throughout: Supabase free, Vercel hobby, Open-Meteo (no key), Anthropic pay-per-use
- No server-side rendering — pure SPA with Vite
- No PWA / offline support
- Single user (no multi-tenancy, no invite flow)

---

## Deploy workflow

Every `git push` to `claude/magical-newton-GpRpx` triggers a production deploy via GitHub → Vercel auto-deploy. Never use `vercel --prod` manually — it breaks the git connection (sets `sourceless: true` on the project).

---

## Since v2.1 — what changed

- Items/Outfits tab rename and tiered stats (main/shoes/accessory/fragrance split, independent ranking per tier)
- Fragrance split out of outfit-detail collage and pieces list
- Formality learned per-user from outfit history; color season removed from Suggest (Shop only)
- Suggest always returns 3 outfits; regenerate variety judged by core pieces only
- Ideas moved from bottom nav into Settings > Wardrobe
- `constants` table + page added (always-worn pieces, kept out of suggestion logic)
- API auth gap closed: all 4 serverless routes now require a verified Supabase session
- In-app password change flow added; sign-up now has confirm-password
- Several desktop layout and mobile grid/thumbnail bugs fixed (see design principles note on `minHeight: 0`)
- Delete-account feature fully planned, not yet built
