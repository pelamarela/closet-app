# Closet App — Product Requirements Document
**v2.1 · June 2026 · Single user: Špela**

---

## Overview

A personal wardrobe manager that helps you catalogue what you own, track what you wear, and get dressed better — with AI suggestions grounded in real weather, your actual wardrobe, and your personal style.

Single-user, mobile-first web app. No social features, no marketplace, no subscriptions.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, TypeScript |
| Hosting | Vercel (GitHub auto-deploy from `claude/magical-newton-GpRpx`) |
| Database + Storage + Auth | Supabase (Postgres + object storage) |
| Weather | Open-Meteo API (no key required) |
| AI | Anthropic Claude (server-side only via Vercel serverless functions) |
| Live URL | closet.pelamarela.com |

---

## Data Model

| Table | Purpose |
|---|---|
| `items` | Wardrobe catalogue. Fields: name, category, subcategory, color, brand, material, pattern, warmth (1–5), formality (1–5), image_url, status (active/archived) |
| `outfits` | Logged outfit wears. Fields: date_worn, occasion, notes, rating, weather snapshot, image_url |
| `outfit_items` | Join table: outfits ↔ items |
| `outfit_ideas` | AI-suggested outfits saved for later. Fields: occasion, reasoning, notes |
| `idea_items` | Join table: outfit_ideas ↔ items |
| `style_profile` | Single row per user. Free-text style description fed into AI prompts |
| `suggestion_feedback` | Thumbs up/down on AI suggestions. Used to improve future suggestions |

---

## Features

### 1. Wardrobe catalogue

- Grid view of all active items, filterable by category
- Select mode: multi-select for bulk archive or delete
- Item card shows photo, name, category tag
- Empty state prompts to add first item

**Add item flow:**
- Tap "Add item" → OS file picker opens immediately
- 1 photo → Item form (AI pre-fills category, colour, brand, material, warmth, formality from the image)
- 2+ photos → Batch upload (AI analyses each photo; review and save all at once)
- Image compression client-side: ~300 KB max, 1200px, JPEG 0.8

**Item detail:**
- Hero image, all metadata fields
- Wear count and last worn date
- Edit or archive from detail view

**Archived items:**
- Separate page under Settings
- Restore to active or permanently delete

---

### 2. Outfit log

- Log a real outfit: select items worn, set occasion, date, optional rating (1–5) and notes
- Pre-populate from a saved idea or from an AI suggestion
- Outfit library: chronological list with wear counts per item
- Outfit detail: collage of items, weather at time of wear, notes, rating
- Edit or delete any logged outfit

---

### 3. AI Suggest

**Input (the brief):**
- Occasion (pick from history-based presets or type custom)
- Anchor item (optional): select one item to build the outfit around
- Weather: auto-fetched from Open-Meteo using device location
- Constraints: "avoid worn this week" toggle, cold-layer rule toggle

**Output:**
- 3 outfit suggestions, each with item thumbnails, reasoning, and pieces list
- Option tabs to switch between suggestions
- Thumbs up/down feedback stored per suggestion
- Regenerate: excludes previously shown core items (tops/bottoms) to force variety
- Save as idea or log directly as a worn outfit

**AI logic (server-side, `api/suggest.ts`):**
- Filters wardrobe by warmth range (based on temp) and formality range (based on occasion)
- If anchor item is set, it is included in every suggestion regardless of filters
- Sends style profile, outfit history, and feedback history to Claude
- Validates returned outfits: must have exactly 1 pair of shoes, valid base (top+bottom or one-piece), no duplicates
- Model: Claude Haiku (fast, cheap, sufficient for structured output)

---

### 4. Ideas

- Saved AI suggestions (or manually created outfit combinations)
- Ideas list with occasion label and item collage preview
- Idea detail: full item list, AI reasoning, option to log as outfit
- Edit: change occasion, notes, swap items
- Delete

---

### 5. Shop

- Paste a product URL or describe an item you're considering buying
- Upload an optional photo
- AI analyses fit against your existing wardrobe: colour harmony, style alignment, gap-filling, formality fit
- Returns a match percentage and honest written reasoning
- Serverless function: `api/analyze-purchase.ts`

---

### 6. Style profile

- Free-text description of personal style (up to 1000 chars)
- Fed verbatim into every AI suggestion and shop analysis prompt
- Write manually or generate automatically from outfit history (requires 5+ logged outfits)
- Accessible from Settings

---

## AI functions (serverless, Vercel)

| Endpoint | Model | Purpose |
|---|---|---|
| `api/suggest` | Claude Haiku | Generate 3 outfit suggestions |
| `api/analyze-item` | Claude Haiku | Pre-fill item form from photo |
| `api/analyze-purchase` | Claude Sonnet | Shop match score + reasoning |
| `api/generate-profile` | Claude Sonnet | Generate style profile from outfit history |

**Security:** Anthropic API key is server-side only, never exposed to the client.

---

## Design principles

- Mobile-first, works on desktop with a two-column layout
- Monochrome palette with a single warm accent (`#9C5544`)
- Typography: monospace for metadata/labels, UI sans for body and headings
- No loading skeletons — spinners only; errors always surfaced visibly, never silent
- Image compression before upload: client-side, keeps Supabase storage lean

---

## Constraints & limits

- Free tiers throughout: Supabase free, Vercel hobby, Open-Meteo (no key), Anthropic pay-per-use
- No server-side rendering — pure SPA with Vite
- No PWA / offline support
- Single user (no multi-tenancy, no invite flow)

---

## Deploy workflow

Every `git push` to `claude/magical-newton-GpRpx` triggers a production deploy via GitHub → Vercel auto-deploy. Never use `vercel --prod` manually — it breaks the git connection.
