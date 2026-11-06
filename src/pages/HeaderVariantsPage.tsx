// Dev-only: options for the app / Today header, each shown above the same sample content. Flat, lowercase, no shadows.
import { useEffect, useState } from 'react'
import { T, fD, fS, V4Icon, Btn } from '../design/kit'
import { R } from '../design/radii'

const DATE = 'fri 06 nov'
const WEATHER = 'cloudy, 11°'

const logo = (size: number) => <img src="/logo.png" alt="" style={{ width: size, height: size, objectFit: 'contain', display: 'block', flexShrink: 0 }} />
const avatar = (bg: string = T.peach) => <div style={{ width: 36, height: 36, borderRadius: R.sm, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fS, fontSize: 15, fontWeight: 600, color: T.ink, flexShrink: 0 }}>š</div>
const title = (size = 24) => <span style={{ fontFamily: fD, fontSize: size, color: T.ink, lineHeight: 1 }}>closet</span>
const info = <span style={{ fontFamily: fS, fontSize: 13, color: T.g500 }}>{DATE}, {WEATHER}</span>
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 9 }

type V = { name: string; note: string; header: React.ReactNode; sub?: React.ReactNode; gap?: number }
const VARIANTS: V[] = [
  { name: 'a  classic', note: 'logo, title, avatar. one small line of date and weather under it',
    header: <div style={{ ...row, justifyContent: 'space-between', height: 58 }}><div style={row}>{logo(32)}{title()}</div>{avatar()}</div>,
    sub: <div style={{ ...row, gap: 7 }}><V4Icon n="sun" s={16} w={1.7} c={T.cocoa} />{info}</div> },
  { name: 'b  one block', note: 'logo, title and the date line stacked in one block, avatar on the right. no extra line',
    header: <div style={{ ...row, justifyContent: 'space-between', height: 62 }}><div style={row}>{logo(36)}<div style={{ display: 'grid', gap: 3 }}>{title(22)}{info}</div></div>{avatar()}</div> },
  { name: 'c  wave accent', note: 'logo and title left, date and weather right, the wave as a small accent after the title',
    header: <div style={{ ...row, justifyContent: 'space-between', height: 56 }}><div style={row}>{logo(30)}{title()}<img src="/brand/wave.png" alt="" style={{ width: 30, display: 'block' }} /></div>{info}</div> },
  { name: 'd  brand strip', note: 'a full-width blush strip with the logo, title and avatar. date and weather inside the strip, right side',
    header: <div style={{ margin: '0 -22px', padding: '0 22px', background: T.peach, ...row, justifyContent: 'space-between', height: 60 }}><div style={row}>{logo(34)}{title()}</div><div style={row}>{info}{avatar(T.paper)}</div></div> },
  { name: 'e  centered', note: 'logo above the title, both centered, avatar top right. date under the title',
    header: <div style={{ position: 'relative', display: 'grid', justifyItems: 'center', gap: 4, padding: '8px 0 0' }}><div style={{ position: 'absolute', right: 0, top: 8 }}>{avatar()}</div>{logo(34)}{title(22)}{info}</div> },
  { name: 'f  logo and weather only', note: 'smallest: logo left, date and weather right. the title lives on the login page and the desktop sidebar',
    header: <div style={{ ...row, justifyContent: 'space-between', height: 50 }}>{logo(32)}<div style={row}>{info}{avatar()}</div></div> },
]

function Frame({ v, photos }: { v: V; photos: string[] }) {
  return (
    <div>
      <div style={{ fontFamily: fS, fontSize: 15, fontWeight: 600 }}>{v.name}</div>
      <div style={{ fontFamily: fS, fontSize: 13, color: T.g500, margin: '2px 0 10px', maxWidth: 340 }}>{v.note}</div>
      <div style={{ width: 360, background: T.paper, padding: '0 22px 22px', overflow: 'hidden' }}>
        {v.header}
        {v.sub && <div style={{ marginTop: 2 }}>{v.sub}</div>}
        <div style={{ marginTop: v.sub ? 12 : 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {photos.slice(0, 4).map((p, i) => <img key={i} src={p} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />)}
        </div>
        <div style={{ fontFamily: fD, fontSize: 21, marginTop: 14 }}>beige body + 5 more</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><Btn kind="quiet" flex={1} icon="repeat">repeat</Btn><Btn kind="peach" flex={1} icon="spark">suggest</Btn></div>
      </div>
    </div>
  )
}

export default function HeaderVariantsPage() {
  const [photos, setPhotos] = useState<string[]>([])
  useEffect(() => { fetch('/preview/items/manifest.json').then(r => r.json()).then((m: { file: string }[]) => setPhotos(m.slice(0, 4).map(e => `/preview/items/${e.file}`))).catch(() => setPhotos([])) }, [])
  return (
    <div style={{ background: T.line, minHeight: '100svh', padding: '32px 24px 80px' }}>
      <div style={{ fontFamily: fD, fontSize: 32 }}>header</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, marginTop: 28 }}>{VARIANTS.map(v => <Frame key={v.name} v={v} photos={photos} />)}</div>
    </div>
  )
}
