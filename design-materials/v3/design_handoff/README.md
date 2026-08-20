# Handoff: Closet App — V4 Redesign

## Overview
V4 is a full UX/UI redesign of a personal wardrobe app (log outfits, get AI outfit suggestions, browse a digital closet, check a potential purchase against what's owned). It replaces an earlier V3 prototype — same functionality, reworked flows/layouts, and a real brand identity (Pelamarela) applied throughout.

## About the Design Files
The files in `source/` are **design references built in HTML/React (in-browser Babel, no build step)** — they show intended look, layout, and interaction, not production code to import as-is. Recreate these screens in the target codebase's real environment (React Native, SwiftUI, Vue, etc. — whatever this product already uses, or the best fit if nothing exists yet), using its own component/data patterns. Copy exact values (colors, spacing, type, copy) from here; don't literally embed this HTML.

## Fidelity
**High-fidelity.** Colors, type, spacing, and copy are final-direction. Photography is placeholder (two-tone diagonal-stripe blocks standing in for real product photos — see "Assets" below) — everything else should be built pixel-accurate.

## Files
- `source/Closet App V4.html` — the full screen set, presented on a pannable canvas grouped by flow (00 Review notes, 01 Today, 02 Log an outfit, 03 Suggest, 04 Closet/Shop, 05 Ideas, 06 Me/Statistics, 07 Desktop). Open in a browser to click through.
- `source/Closet App V4 - Design System.html` — the design system reference page: typography, color, all components with every interaction state, icon legend, spacing.
- `source/v4-kit.jsx` — shared primitives: tokens (`T`), icon set (`V4Icon`), buttons, pills, cards, sheets, tabs, status bar, screen shell. **Start here.**
- `source/v4-today.jsx`, `v4-closet.jsx`, `v4-log.jsx`, `v4-suggest.jsx`, `v4-ideas.jsx`, `v4-profile.jsx`, `v4-stats.jsx` — one file per flow/tab.
- `source/v4-desktop.jsx` — desktop/wide-viewport layouts (sidebar nav instead of bottom tabs).
- `source/v4-ds-page.jsx` — builds the design system reference page.
- `design-system-tokens/colors_and_type.css` — the Pelamarela brand's raw CSS custom properties (source of truth for hex values/fonts, in `--ds-color-*` / `--ds-font-*` form).
- `assets/` — logo, umbrella icon, and the two hand-painted "wave" motif images.

## Design Tokens

### Color (from `T` in v4-kit.jsx)
| Token | Hex | Role |
|---|---|---|
| paper | #F7F6F5 | App background (never pure white) |
| white | #FFFFFF | Cards/sheets that need to lift off paper |
| ink | #000000 | Primary text, primary button fill |
| peach | #F2E1D0 | Signature accent fill (info cards, active chips) |
| peachSoft | #FAF2EA | Lighter peach fill (Shop chip, quote cards) |
| peachDeep | #E9CBB0 | Peach hover/active state |
| rose | #DFAFA1 | Secondary accent, used sparingly |
| roseSoft | #ECCFC4 | — |
| roseDeep | #C98E7C | Rose hover/active, negative-emphasis text |
| cocoa | #6F4E37 | Warm secondary text on peach/paper |
| cocoaSoft | #8A6B54 | — |
| cocoaDeep | #543A29 | — |
| line | #E6E3E0 | Hairline borders/dividers everywhere |
| g700 | #2B2B29 | Near-black text alt |
| g500 | #5A5854 | Secondary body text |
| g400 | #8A8884 | Placeholder text, disabled/quiet icons |
| g200 | #D9D6D2 | Disabled fills, dashed borders |

### Typography
- **Syne** — H1/H2 display headings ONLY (`fD` = `"Syne", system-ui, sans-serif`). Used sparingly — screen titles, big numbers, hero copy.
- **Poppins** — everything else: body text, buttons, pills, labels, nav (`fS` = `"Poppins", system-ui, sans-serif`). Weights kept light (400/500/600) — avoid bold; the app should read soft, not shouty.
- **Space Mono** — true metadata only: percentages, counts, timestamps, "claude sonnet" model tag (`fM` = `"Space Mono", ui-monospace, monospace`). Never for UI labels or buttons.
- Type scale in use: 11–13px (mono/meta), 13–15px (body/UI), 19–36px (Syne headings). Nothing under 11px.

### Spacing & Shape
- Screen horizontal padding: 22px.
- **Border radius: 0–2px everywhere — the design is intentionally sharp-cornered, not rounded.** Do not add rounded corners to cards, buttons, tiles, or sheets.
- Borders are 1px hairlines in `line` (#E6E3E0); avoid heavier borders or drop shadows except the sheet/modal shadow noted below.
- Standard tap target height: 44–52px (buttons), 40px (pills), 36–44px (round icon buttons).

### Icon system
Custom 24×24 stroke icon set (`V4Icon`, 1.6–1.9px stroke, no fill). **Each icon has exactly one fixed meaning — never reuse an icon's shape for an unrelated action.** Full legend is in the design system page; key ones:
- `home` → Today tab · `hanger` → Closet tab, add-item entry points, Shop's "check what I own" · `bulb` → Ideas tab · `user` → account/settings · `bag` → Shop tab
- `plus` → add-new affordance · `cal` → calendar / Log Outfit action · `spark` → AI-generated actions (Suggest, drafting, verdicts)
- `check` → confirm/save, grid selection, completed step · `bookmark` → save as idea · `archive` → archive an item · `trash` → delete a record · `pen` → edit a record
- `back` → navigate back/cancel · `next` → row disclosure chevron · `close` → dismiss/reject/negative · `cam` → photo capture/retake
- `chart` → statistics · `caret` → dropdown trigger · `repeat` → wear again

No search icon/affordance anywhere — search is not a feature of this app.

## Components (all documented with every state in the Design System page)
- **Btn** — 4 kinds: `primary` (ink fill), `peach` (accent fill), `quiet` (outlined), `white`. States: idle / hover / active(press) / disabled, all via CSS classes (`v4-btn-*`), not inline styles — reuse that hover/active pattern in the target stack.
- **RoundBtn** — icon-only circular action button, same kind variants.
- **Pill** — filter/category chip, `on`/`off`, optional count badge, `sm`/`lg` sizes, with hover/active states.
- **Dropdown** — text trigger + caret, opens a bordered options panel below/aligned; used for time-grain pickers (Statistics).
- **V4Card** — generic content card, flat fill, no shadow by default.
- **ItemTile** — closet grid tile: photo placeholder + worn-count badge + selected state (ring).
- **Row4** — 4-column label/value list row (used in item detail, stats) with hover state and last-row-no-divider rule.
- **Sheet / Scrim** — bottom-sheet modal pattern (Log, Suggest brief, Shop check) — dark scrim behind, sheet slides from bottom, drag handle, sticky footer CTA.
- **TodayHeader** — app-wide top bar (logo + wordmark + avatar), sits above every screen's own contextual bar, bottom hairline border. **Must appear on literally every screen** — this was a specific requirement.
- **V4Bar** — contextual bar under TodayHeader: back button + title + right-side icon(s).
- **V4Tabs** — bottom tab bar (mobile): Today, Closet, Suggest (center, elevated), Ideas, Me.
- **StatsHead / BarStat / DotScale / Dots** — statistics-screen furniture (tab switcher, horizontal bar stat, dot-scale rating, carousel page dots).
- **Wave motif** — hand-painted brushstroke image (`assets/wave.png`, `wave-rose.png`), used ONLY for no-data moments: Today empty state, Suggest loading, Log confirmation. Never on ordinary content screens.

## Screens
**01 Today** — Today (logged / empty), Month calendar (single-color day cells, no double-encoding), Outfit detail.
**02 Log an outfit** — Step 1 (pick pieces, visible tray), Step 2 (context), Saved confirmation (wave motif + single full-width "Wear it today" CTA — no secondary "save as idea" button here, that action lives on the outfit result screen).
**03 Suggest** — Brief (one occasion question + weather context, not four form fields), Loading (named steps, not a bare spinner), Result (swipeable full-bleed outfit cards, reasoning card, wear/save actions), **Error** ("Couldn't put those looks together" — retry without losing the brief).
**04 Closet / Shop** — Wardrobe grid (category pills, Add + Shop chips in the header — Shop is a persistent header entry point, not a buried banner), Item detail, Shop check (paste link / describe / photo sheet), Shop verdict (percent-fit score, bar stats, "you already own" comparison), **Shop error** ("Couldn't read that link" — inline retry, sheet stays open).
**05 Ideas** — Ideas list (saved suggestions), Idea detail.
**06 Me** — Me (account hub: Statistics / Ideas / Archived / Constants as real destinations), Statistics × 3 (Pieces / Outfits / Colour, each with a time-grain Dropdown), How I dress (style profile).
**07 Desktop** — Today and Closet at a wide viewport: sidebar nav replaces bottom tabs, "Log an outfit" pinned at the top of the sidebar.

Outfit **thumbnail collages** (used wherever a saved/suggested outfit is shown as one image) follow a fixed compositing rule, not a plain grid: items are tiered by importance — main pieces (tops/bottoms/outerwear/shoes) get one large block on the left; secondary items (bags, accessories) and tertiary items (fragrance etc.) stack in a smaller right-hand sidebar; with few enough items it falls back to an even grid. Clothing photos crop from the top (shot on a person/hanger); everything else crops from the center (flat product shot). This logic is implemented as placeholder-photo composition in `Ph`/`OutfitThumb` in `v4-kit.jsx` — the real image-cropping logic needs to be built server- or client-side against actual photos.

## Interactions & Behavior
- Bottom sheets (Log, Suggest brief, Shop check) slide up over a scrim, sticky footer CTA stays pinned while content scrolls underneath.
- Suggest result cards are horizontally swipeable, one look per card, with page dots.
- All interactive elements (buttons, pills, tiles, list rows, dropdown options) have real hover + active(press, scale ~0.97) + disabled states — see the CSS block at the top of `v4-kit.jsx` (`v4-btn`, `v4-pill`, `v4-tile`, `v4-row4`, `v4-dd-*` classes) and the Design System page's "interaction states" groups for every variant rendered side-by-side.
- Calendar day cells: exactly one flat-color box per cell (no nested border + fill double-encoding); the selected day uses an inset ring so it doesn't shift alignment against neighboring cells.
- No search feature anywhere in the app (deliberately out of scope).

## State Management (implied by the mocks — not implemented in these static files)
- Selected category filter (Closet pills) and selected grid items (Log step 1) are visual toggle states only.
- Suggest flow: brief answers → loading step-progress → 3 generated results (carousel index) → wear/save/error.
- Shop flow: input (link/text/photo) → loading → verdict or error.
- Statistics: selected tab (Pieces/Outfits/Colour) × selected time grain (Weekly/Monthly/Yearly) drives the data shown.

## Assets
- `logo-full.png`, `umbrella-icon.png` — Pelamarela brand mark (from the attached design system).
- `wave.png`, `wave-rose.png` — hand-painted brushstroke motif, two tones.
- All clothing/product imagery in the mocks is a **placeholder** (diagonal two-tone stripe pattern, generated in code via `Ph`/`ItemTile` in `v4-kit.jsx`) standing in for real photography — replace with actual item photos, respecting the top-crop (clothing) vs. center-crop (flat product) rule noted above.
