# Closet app

## Locale

US vs EU not yet settled for this project. Ask before writing any date or copy.

## Design rule: no AI-slop (FORCED)

Applies to every screen, component, prototype and piece of copy in this project. Before building or restyling anything, check the work against this list. If something on the list is already in the app, remove it when you touch that screen, and say so.

Avoid:

1. Tags and pills used as decoration (use them only where they are a real filter or status control)
2. Excessive italics
3. Instrument Serif
4. Negative letter-spacing (kerning) on text
5. Over-the-top detailed UI (too many small details, glows, micro-decorations)
6. Overusing dividers
7. Many color shades and opacities (stick to the tokens in `src/design/kit.tsx`)
8. Containers with borders (separate with space or surface color instead)
9. Overly detailed diagrams
10. Verbose, redundant text
11. Code-style breadcrumbs
12. Section numbering
13. Eyebrows (small labels above headings)
14. Dithering
15. ASCII images
16. Squircles
17. Excessive mono fonts (mono only for real data such as numbers)
18. ALL CAPS subtitles
19. Gradient backgrounds
20. Periods at the end of titles

When unsure whether something counts, pick the plainer option.

## Shape (FORCED)

Flat edges: corner radius 2px at most, no drop shadows. Circles only for dots, switches and avatars. Separate things with surface color and space.

## Copy (FORCED)

- All UI text in lowercase (titles, buttons, chips, labels, toasts). Brand voice, no exceptions except real names.
- Short labels: one or two words where possible ("check", "repeat", "log"). No helper sentences, no captions the user didn't ask for.
- Category labels always come from `src/lib/categoryLabel.ts` (top, btm, 1pc, otw, shoe, acc, frag). Never type a category name by hand and never use the full words.
- No item names under photo tiles in grids (Closet, Ideas, Log picker). Photos carry the grid; names live on the detail page.
