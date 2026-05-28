# Personal Closet App — Product Requirements Document

**Owner:** Špela Anzeljc Gačnik
**Purpose of this doc:** Hand-off spec for building the app in Claude Code.
**Status:** v1 scope defined. Two decisions open — see §9. Everything else is settled.

> Note to the building agent: this is a **personal, single-user** app. Prioritise simplicity and shipping the thin slice (Phase 1) over completeness. Do not add features beyond this spec without flagging them. Get a live URL working first, then build phase by phase.

---

## 1. Summary

A personal web app for cataloguing a wardrobe, logging worn outfits to a dated library, and getting outfit suggestions based on the user's items, the occasion, local weather, and outfit history. Mobile-first, accessed via a **public URL on any device**, with data synced through a cloud backend. Single user (the owner) — not multi-tenant.

## 2. Goals

- Catalogue 150–400 clothing items with photos and structured attributes.
- Record ("log") an outfit and save it to a dated library / calendar.
- Generate outfit suggestions from items + occasion + local weather (+ history when available).
- Accessible from any device via a URL; data synced through a cloud backend.

## 3. Non-goals (v1)

- **AI auto-recognition** of items from photos. Manual entry only in v1 — but the schema must leave room to add it later (see §5).
- Multi-user, sharing, or social features.
- Native mobile apps. (PWA-friendliness is a nice-to-have, not a requirement.)
- Shopping, price tracking, or any e-commerce integration.

## 4. Tech stack (decided)

- **Frontend:** React + Vite, Tailwind CSS, mobile-first.
- **Repo + deploy:** GitHub repo, deployed via **Vercel**. Vercel provides the public URL and the serverless functions.
- **Backend / data:** **Supabase** (Postgres + Storage + Auth). Free tier.
- **Weather:** **Open-Meteo** (free, no API key).
- **Suggestions:** **Anthropic Messages API**, called from a **Vercel serverless function** — the API key lives server-side only, never in client code. Use a current Sonnet-tier model for the cost/latency balance; confirm the exact current model string at `docs.claude.com`.

### Role split (who does what)

| Component | Job |
|---|---|
| GitHub | Stores the **code**. |
| Vercel | Hosts the **live app at a public URL**; runs serverless functions. |
| Supabase | Stores all **app data** (items, outfits, photos) + handles **auth**. |
| Open-Meteo | Live **weather**. |
| Anthropic API | Outfit **suggestion reasoning**. |

GitHub and Supabase do two different jobs: code vs. data. Do not store app data (items, photos, logs) in the repo.

## 5. Data model

Three core tables plus a small style-profile config.

### `items`
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | e.g. "black Alaïa ballet flats" |
| category | text | controlled vocab: top / bottom / dress / outerwear / shoes / accessory |
| subcategory | text | optional, e.g. blazer, jeans |
| color | text | |
| pattern | text | optional |
| material | text | optional |
| warmth | int (1–5) | **required** — drives weather matching |
| formality | int (1–5) | **required** — drives occasion matching |
| brand | text | optional |
| image_url | text | points to the file in Supabase Storage |
| status | text | active / archived |
| created_at | timestamptz | |

`color`, `pattern`, `material` are the fields a future AI-recognition step would populate — keep them nullable so they can be filled later.

### `outfits`
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| date_worn | date | the calendar hook; default today |
| occasion | text | |
| weather | jsonb | snapshot (temp + conditions) at log time |
| rating | int (1–5) | optional — did you like it |
| image_url | text | optional photo of the worn outfit |
| notes | text | optional |
| created_at | timestamptz | |

### `outfit_items` (join table)
| Field | Type | Notes |
|---|---|---|
| outfit_id | uuid (FK → outfits) | |
| item_id | uuid (FK → items) | |

Many-to-many: one item lives in many outfits, one outfit is built from many items. This join powers **outfit history** — wear counts, last-worn dates, pairing data — which feeds the suggestion engine.

### `style_profile`
A single editable free-text description of the owner's style, fed into the suggestion prompt. Implement as a one-row table or simple key-value config — whatever is least complex.

## 6. Functional requirements (phased)

### Phase 1 — Wardrobe catalogue (thin slice — ship this first)
- Auth: user logs in; closet is private (see §9).
- Add item: form with the fields in §5 + photo upload.
- **Image handling:** compress/resize **client-side before upload** — target ~300 KB (e.g. max 1200px long edge, JPEG ~0.8 quality). Store in Supabase Storage; save the URL on the item. This is a hard requirement, not optional (see §8).
- Grid/list view of items; filter by category; edit and archive an item.
- Deployed to Vercel; usable on a phone via the live URL.

**Acceptance:** can add, view, edit, and archive items with photos on a phone via the live URL; data persists and syncs across devices.

### Phase 2 — Outfit library / calendar
- "Log an outfit": pick items from the wardrobe, attach a date (default today), occasion, optional photo, optional rating/notes. Writes to `outfits` + `outfit_items`.
- Library view: browse logged outfits as a calendar and/or a date-sorted list.
- View an outfit's items; show per-item "last worn" and wear count derived from the join.

**Acceptance:** can record an outfit from existing items with a date and see it in the library and on a calendar.

### Phase 3 — Outfit suggestions
- Inputs: occasion (user-selected), local weather (Open-Meteo by location), candidate items, `style_profile`, recent outfit history.
- Engine (recommended hybrid): pre-filter candidates in code by warmth (vs. temperature) and formality (vs. occasion); send the filtered set + context to the Anthropic API; return 1–3 outfit suggestions with brief reasoning. Suggestions must only use items the owner actually owns.
- Accepting a suggestion pre-fills the Phase 2 "log an outfit" flow.

**Acceptance:** given a chosen occasion and current weather, returns sensible combinations drawn only from owned items, and one can be logged in a single tap.

## 7. Non-functional requirements

- **Mobile-first** responsive UI; primary use is on a phone.
- **Public URL** via Vercel; works on any device/browser without install.
- **Security:** Supabase Row-Level Security so only the authenticated owner can read/write. The Anthropic API key lives only in serverless functions, never shipped to the client. Open-Meteo needs no key.
- **Performance:** compressed images; lazy-load the item grid.
- **Cost:** stay within the Supabase, Vercel, and Open-Meteo free tiers. The Anthropic API is pay-per-use (a few cents per suggestion call).

## 8. Constraints / known gotchas

- **Supabase free tier:** 500 MB database, 1 GB file storage, 5 GB egress/month. Structured data is tiny; **image compression is what keeps 400+ photos under the 1 GB file-storage limit** — treat it as a hard requirement.
- **Supabase project pausing:** free projects pause after 7 days of inactivity (data retained; manual resume from the dashboard). Acceptable for v1. Optional later: a scheduled keep-alive ping (e.g. a GitHub Actions cron every few days) if pausing becomes annoying.

## 9. Open decisions (confirm before building the affected phase)

1. **Auth method.** Recommended: Supabase **email magic-link** (passwordless), single user. Alternative: email + password. Either works; both require RLS. → *Confirm before Phase 1.*
2. **Suggestion engine approach.** Recommended: **hybrid** (code pre-filter + Claude composes). Alternatives: pure rules (free, deterministic, brittle) or pure LLM (most flexible, slightly costlier per call). → *Confirm before Phase 3; does not block Phases 1–2.*

## 10. Build sequence

1. Repo + Vercel deploy of an empty app — **get the URL live first.**
2. Supabase project: schema (§5), a Storage bucket for images, Auth + RLS.
3. Phase 1 (catalogue) → ship and use it.
4. Phase 2 (library/calendar) → ship.
5. Phase 3 (suggestions) → ship.
