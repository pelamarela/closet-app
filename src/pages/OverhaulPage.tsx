// Dev-only: the plan for the whole-app overhaul. Nothing here changes the real app.
import { Link } from 'react-router-dom'
import { T, fS, Disp, Body } from '../design/kit'
import { R } from '../design/radii'
import { usePreviewPalette } from '../design/previewPalette'

const SWATCHES: [string, string, string][] = [
  ['White', '#FFFFFF', 'Page'], ['Cream', '#FCF9F4', 'Cards, soft surfaces'], ['Blush', '#E1AFA1', 'Soft buttons, tiles'],
  ['Pink', '#E9558C', 'Tiles only, small accents'], ['Rosewood', '#5E3436', 'Links, active state, headlines'], ['Espresso', '#1B1210', 'Text, main buttons'],
]

const COMPONENTS: [string, string][] = [
  ['Button', 'Three kinds only: main (espresso), soft (blush), quiet (outline). One height on mobile (48), 2px corners. Loading state built in.'],
  ['Chip', 'One component for filters and pickers, with the sliding highlight. Single or multi select. Replaces Pill and most Dropdowns.'],
  ['Segmented', 'For 2 to 4 options (period, view, grain). Replaces the Stats dropdowns and the tab pills.'],
  ['Card', 'Cream surface, 2px corners, no shadow, no border. The only container. Replaces V4Card and every hairline box.'],
  ['Tile', 'Photo or colored placeholder, 3:4, selectable, optional small badge. Used in Closet, Log, Suggest, week strip, rows.'],
  ['Row', 'List row with space between rows instead of divider lines. Leading image, title, one value, chevron.'],
  ['Field', 'Underline input with label inside. One component for text, select, textarea. Date is a field that opens the calendar right under it (React Aria Calendar, restyled flat), prefilled from where you came from.'],
    ['Screen', 'One wrapper for every page: header (title and one action), padding, max width, loading, empty and error states.'],
  ['Grid', 'One responsive grid for tiles and cards: 2 columns on phones, 3 on tablets, 4 to 6 on desktop.'],
  ['Toast', 'Confirmation after saving, instead of the separate "Logged" screen.'],
]

const NAV: [string, string][] = [
  ['Tabs', 'Today, Closet, Ideas, Me as icons only (no labels) in a floating white bar inset 12px from the edges. Selected tab has a blush block with a dark icon.'],
  ['Log button', 'A dark square in the middle of the same bar, same size as the tabs, nothing raised. On desktop it sits at the top of the sidebar.'],
  ['Suggest', 'A main button on Today and on Closet, not a tab.'],
  ['Shop', 'Moves into Closet as "Check a piece" in the header. Leaves the sidebar.'],
  ['Statistics', 'Moves under Me as the first card. Leaves the sidebar.'],
  ['Desktop', 'Sidebar with the same four plus Log. No top header. Content max width 1100.'],
  ['Back', 'Detail pages get a back arrow in the header and keep their tab highlighted.'],
]

const SCREENS: [string, string, string][] = [
  ['Today', 'Weather headline, one big outfit, week strip, two rows (past, saved). Preview exists.', 'Empty state is one card with Log and Suggest.'],
  ['Closet', 'Chip filters, tile grid, "Check a piece" and add button in the header.', 'Shop folds in here. Add item and Batch upload become one "Add" flow (photos first, details auto-filled, review).'],
  ['Item detail', 'Big photo, details as Rows, worn-with row of tiles.', 'Edit reuses the same page.'],
  ['Log outfit', 'A full page, not a sheet. Header and the chosen pieces stay pinned at the top while a dense grid scrolls (4 per row on phones, more on desktop), with category chips. A pinned bar at the bottom has one clear button: next. The second step has everything the current app has, with short labels: date field, occasion chips plus an other box, a feel rating, a note and a photo, with save. The date is prefilled: today when you start from the Log button, the chosen day when you start from a calendar or week-strip date.', 'Two steps and the Saved screen become one page and a toast.'],
  ['Suggest', 'Brief as a full page (occasion, look, optional anchor piece). Result as swipeable looks.', 'Result gets a Log this button. Loading state becomes the button itself.'],
  ['Ideas', 'Tile grid of saved looks, filter chips.', 'Idea edit reuses the idea page.'],
  ['Month', 'Calendar grid of outfit tiles, list for the chosen day.', 'Reached from Today, no tab.'],
  ['Outfit detail', 'Back, date, title, occasion, collage of the pieces, "In this look" rows, Edit, Wear again, Delete. Opened from the Today hero, the week strip, past outfits and Month.', 'Edit and Wear again open the Log page with the pieces already chosen.'],
  ['Me', 'Statistics, How I dress, Account, Archive, Constants as cards.', 'Style profile editor stays a page.'],
  ['Statistics', 'Segmented control for the view, one chart style, fewer sections.', 'Dropdowns become Segmented.'],
  ['Login', 'Logo, two fields, one button.', 'No change in logic.'],
]

const ORDER: [string, string][] = [
  ['1 Tokens', 'Palette, fonts, radii, shadows move into one tokens file. Old names kept as aliases so nothing breaks.'],
  ['2 Components', 'Build Button, Chip, Segmented, Card, Tile, Row, Field, Screen, Grid, Toast. Show them on /lab.'],
  ['3 Shell', 'New tab bar and sidebar. Move Shop and Statistics.'],
  ['4 Today', 'Replace with the Home preview.'],
  ['5 Closet and Item', 'Grid, filters, detail, merged Add flow.'],
  ['6 Log', 'Full-page Log with a toast.'],
  ['7 Suggest and Shop', 'Brief page, results, check a piece.'],
  ['8 Ideas, Month, Outfit', 'Move onto Tile, Row and Grid.'],
  ['9 Me and Statistics', 'Cards and Segmented.'],
  ['10 Clean up', 'Delete old kit components, dead styles and the dev preview pages.'],
]

const OPEN: string[] = [
  'US or EU for dates, units and spelling (CLAUDE.md still has the Locale question open).',
  'Whether the raised Log button keeps its shape or becomes a normal tab with a plus.',
  'Whether Ideas stays its own tab once Suggest results can be logged directly.',
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 44 }}>
      <Disp s={26}>{title}</Disp>
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  )
}
function Item({ name, text }: { name: string; text: string }) {
  return (
    <div style={{ background: T.white, borderRadius: R.md, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 600 }}>{name}</div>
      <div style={{ fontFamily: fS, fontSize: 13.5, color: T.g500, marginTop: 4, lineHeight: 1.5 }}>{text}</div>
    </div>
  )
}

export default function OverhaulPage() {
  const ready = usePreviewPalette()
  if (!ready) return null
  return (
    <div style={{ background: T.paper, minHeight: '100svh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 22px 100px' }}>
        <Disp s={38}>App overhaul plan</Disp>
        <Body s={14.5} style={{ marginTop: 10 }}>Same four tabs, one design system, simpler flows. Nothing in the real app changes until each step below is approved.</Body>
        <div style={{ marginTop: 18 }}><Link to="/preview" style={{ fontFamily: fS, fontSize: 14, color: T.cocoa }}>Open the clickable prototype, all screens</Link></div>

        <Section title="Look">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {SWATCHES.map(([n, c, u]) => (
              <div key={n} style={{ background: T.white, borderRadius: R.md, overflow: 'hidden' }}>
                <div style={{ height: 52, background: c, boxShadow: c === '#FFFFFF' ? 'inset 0 -1px 0 #ECE6DF' : 'none' }} />
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 600 }}>{n} <span style={{ color: T.g400, fontWeight: 400 }}>{c}</span></div>
                  <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500, marginTop: 2 }}>{u}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Item name="Fonts" text="Tenor Sans for titles, Manrope for everything else. No mono, no italics, no caps, no periods in titles." />
            <Item name="Shape" text="Flat: 2px corners at most, no drop shadows. Circles only for dots and avatars. Surface color separates things instead of borders. No dividers, no gradients, no dotted grid." />
            <Item name="Spacing" text="4, 8, 12, 16, 24, 32, 48. Space does the separating." />
          </div>
        </Section>

        <Section title="Components">
          {COMPONENTS.map(([n, t]) => <Item key={n} name={n} text={t} />)}
          <Item name="Shared logic" text="Every data page goes through Screen, so loading, empty and error look the same. Lists use one hook shape. Page animations come from one place (rise, tab slide)." />
        </Section>

        <Section title="Navigation">
          {NAV.map(([n, t]) => <Item key={n} name={n} text={t} />)}
        </Section>

        <Section title="Grids">
          <Item name="Columns" text="Phone 2, tablet 3, desktop 4, wide 6. Gap 12 on phone, 16 on desktop." />
          <Item name="Rows" text="Horizontal scrolling rows for previews on Today. Full grids on Closet, Ideas, Month." />
          <Item name="Page width" text="Phone full width with 22px sides. Desktop content max 1100 next to the sidebar. Two-column layouts use fr ratios, never fixed pixels." />
        </Section>

        <Section title="Screens and flows">
          {SCREENS.map(([n, layout, flow]) => <Item key={n} name={n} text={`${layout} ${flow}`} />)}
        </Section>

        <Section title="Order of work">
          {ORDER.map(([n, t]) => <Item key={n} name={n} text={t} />)}
          <Body s={13.5} style={{ marginTop: 8 }}>Each step is its own change, checked in the running app before the next one starts. Nothing is committed until you say so.</Body>
        </Section>

        <Section title="Still open">
          {OPEN.map(t => <Item key={t} name="Decision" text={t} />)}
        </Section>
      </div>
    </div>
  )
}
