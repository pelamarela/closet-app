# Resume Closet App Session

Get oriented and ready to work on the closet-app project.

## Project Context

Personal wardrobe web app for Špela. Single-user, mobile-first.

**Stack:** React + Vite (frontend), Vercel (host + serverless functions), Supabase (Postgres + Storage + Auth), Open-Meteo (weather, no key), Anthropic Messages API (outfit suggestions, server-side only).

**Live URL:** https://closet.pelamarela.com  
**GitHub:** https://github.com/pelamarela/closet-app (branch: `claude/magical-newton-GpRpx`)  
**Supabase:** https://vxqnaxwkdjwibqvnwkhf.supabase.co

**Data model:** `items`, `outfits`, `outfit_items` (join), `outfit_ideas`, `idea_items` (join), `style_profile`

**All phases are built:**
- Phase 1 ✅ — wardrobe catalogue, batch upload, photo compression, edit/archive
- Phase 2 ✅ — outfit log form, calendar library, detail with wear counts
- Phase 3 ✅ — suggest page with Open-Meteo weather, Claude Sonnet via /api/suggest, style profile editor
- Phase 4 ✅ — ideas (saved AI outfits), shop (purchase analysis), archived items page

**Key constraints:**
- Image compression: client-side, ~300 KB, max 1200px, JPEG 0.8
- Anthropic API key is server-side only (Vercel serverless fn, never client)
- Stay within free tiers

**Serverless functions:** api/suggest, api/analyze-item, api/generate-profile, api/analyze-purchase

## Deploy workflow

**GitHub → Vercel auto-deploy is active.** Every `git push` to `claude/magical-newton-GpRpx` triggers a production deploy automatically. There is only one Vercel project: `closet-app`.

**Never use `vercel --prod` manually** — it bypasses Git and creates sourceless deployments that break the auto-deploy connection.

The correct workflow for any change:
```bash
git add -A
git status          # ALWAYS verify — confirm every changed file is staged before committing
git commit -m "..."
git push origin claude/magical-newton-GpRpx
```

**CRITICAL: Always use `git add -A` and always run `git status` after staging to confirm nothing is left out before committing.** Never enumerate files manually — partial commits leave changes in local-only state and break the live site when auto-deploy picks up the incomplete GitHub version. This has caused production outages before.

If auto-deploy ever stops working, the likely cause is `sourceless: true` on the Vercel project (set when `vercel --prod` is run manually). Fix by running:
```bash
vercel git disconnect
vercel git connect https://github.com/pelamarela/closet-app
```

## Steps

1. Run `vercel ls` to confirm the latest deployment is READY and matches the most recent git commit.
2. Run `vercel env ls` to confirm env vars are in place.
3. Print a short ready summary: latest deploy status, live URL, and what was last worked on (check `git log --oneline -5`).
4. Ask: "What do you want to work on today?"
