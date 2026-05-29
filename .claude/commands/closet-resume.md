# Resume Closet App Session

Get oriented and ready to work on the closet-app project.

## Project Context

Personal wardrobe web app for Špela. Single-user, mobile-first.

**Stack:** React + Vite + Tailwind (frontend), Vercel (host + serverless functions), Supabase (Postgres + Storage + Auth), Open-Meteo (weather, no key), Anthropic Messages API (outfit suggestions, server-side only).

**Live URL:** https://closet.pelamarela.com  
**GitHub:** https://github.com/pelamarela/closet-app (branch: claude/magical-newton-GpRpx)  
**Supabase:** https://vxqnaxwkdjwibqvnwkhf.supabase.co

**Data model:** `items`, `outfits`, `outfit_items` (join), `style_profile`

**All phases are built:**
- Phase 1 ✅ — wardrobe catalogue, batch upload, photo compression, edit/archive
- Phase 2 ✅ — outfit log form, calendar library, detail with wear counts
- Phase 3 ✅ — suggest page with Open-Meteo weather, Claude Sonnet via /api/suggest, style profile editor

**Key constraints:**
- Image compression: client-side, ~300 KB, max 1200px, JPEG 0.8
- Anthropic API key is server-side only (Vercel serverless fn, never client)
- Stay within free tiers

**Serverless functions:** api/suggest, api/analyze-item, api/generate-profile

## Steps

1. Run `vercel ls` to show the latest deployment status and confirm the live URL is up.
2. Run `vercel env ls` to confirm env vars are in place.
3. Print a short ready summary: latest deploy URL + status, live URL, and what was last worked on (check recent git log with `git log --oneline -5`).
4. Ask: "What do you want to work on today?"
