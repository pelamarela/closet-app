// Dev-only: where the app breaks the design rules in CLAUDE.md.
import { T, fS, Disp, Body } from '../design/kit'
import { R } from '../design/radii'

type Group = { title: string; note?: string; items: { rule: string; where: string }[] }

const GROUPS: Group[] = [
  {
    title: 'Copy rules',
    note: 'Lowercase, short labels, categories from one place. Found in the current app.',
    items: [
      { rule: 'Category labels', where: 'Fixed: Suggest, Stats, Idea edit and the prototype now use catLabel (top, btm, 1pc, otw, shoe, acc, frag). Stats group titles and Suggest chips were full words before.' },
      { rule: 'Capitalized text', where: 'About 190 lines across 24 pages. Most in Stats (22), Batch upload (14), Log outfit (13), Closet (11), Shop (11), Today (10), Suggest (10), Add item (10). Tabs and sidebar too (Today, Closet, Ideas, Me, Statistics, Shop).' },
      { rule: 'Long button labels', where: 'Wear it today, Wear this today, Add the details, Suggest three looks, Put together three looks, Draft from my history, Back to today, Back to brief, View wardrobe, Add first item, Log an outfit, Save outfit, Choose photos' },
      { rule: 'Long titles', where: 'Having a look through your closet, Couldn\'t put those looks together, What the closet is made of, Where you actually go, Colour through the week, Combinations you repeat, Most and least worn, Signature palettes, Labels you trust' },
      { rule: 'Helper sentences', where: '13 lines: Archived, Login, Style profile, Shop (twice), Change password, Stats (twice), Suggest, Closet empty, Constants (twice), Today reminder' },
      { rule: 'Color names', where: 'colorBuckets (12 labels such as Cream / beige, Navy / blue) and colorSeasons (12 names plus a sentence each)' },
      { rule: 'Weekday names', where: 'Stats and Today use Sun, Mon and so on with capitals' },
    ],
  },
  {
    title: 'Judgment calls',
    note: 'Kept as they are.',
    items: [
      { rule: '17 Mono fonts', where: 'About 60 uses on almost every page, mostly captions and dates' },
      { rule: '6 Dividers', where: '6 on Today, about 30 hairlines under rows and headings (Log outfit, Stats, Closet, Batch upload, forms), sidebar and header lines' },
      { rule: '8 Bordered containers', where: 'Hairline outlines around photos (Today week strip, Shop, Stats, Month), quiet buttons, dropdown menu, 6 dashed add boxes' },
      { rule: '1 Pills and tags', where: 'Filters and pickers are real controls, fine. Decorative: count badges in pills, worn badges on tiles, occasion badges on photos' },
      { rule: '7 Shades and opacities', where: '32 different rgba and opacity values on top of the color tokens' },
      { rule: '5 Over-detailed UI', where: 'Glare sweep on tiles, border beam on Suggest loading, confetti, photo shimmer' },
      { rule: '10 Verbose text', where: 'Not fully read. Likely: sentences under headings on Today empty, Suggest, Shop' },
    ],
  },
  {
    title: 'Not found',
    items: [
      { rule: '2, 3, 9, 11, 14, 15', where: 'Italics, Instrument Serif, diagrams, breadcrumbs, dithering, ASCII images' },
    ],
  },
]

export default function AuditPage() {
  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 22px 80px', background: T.paper, minHeight: '100svh' }}>
      <Disp s={30}>Design rule audit</Disp>
      <Body s={13.5} style={{ marginTop: 8 }}>Open items under the rules in CLAUDE.md. All of these stay as they are.</Body>
      {GROUPS.map(g => (
        <section key={g.title} style={{ marginTop: 32 }}>
          <Disp s={20}>{g.title}</Disp>
          {g.note && <Body s={13} style={{ marginTop: 4 }}>{g.note}</Body>}
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            {g.items.map(it => (
              <div key={it.rule} style={{ background: T.white, borderRadius: R.md, padding: '14px 16px' }}>
                <div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 600 }}>{it.rule}</div>
                <div style={{ fontFamily: fS, fontSize: 13, color: T.g500, marginTop: 4, lineHeight: 1.45 }}>{it.where}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
