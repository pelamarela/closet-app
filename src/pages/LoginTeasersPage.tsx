// Login teaser block (also shown alone at /login-teasers in dev): three app cards in a grid on one panel.
// Every size is in panel units (u), so the whole composition scales with its width.
import type { CSSProperties, ReactNode } from 'react'
import { T, fD, fS, V4Icon } from '../design/kit'
import { R } from '../design/radii'

const u = (n: number) => `calc(${n} * 100cqw / 360)`
const pic = (n: string) => `/teasers/${n}.jpg`

function Thumb({ n, size, h }: { n: string; size?: number; h?: number }) {
  return (
    <div style={{ width: size ? u(size) : '100%', height: u(h ?? size ?? 0), background: T.surface, borderRadius: R.sm, flexShrink: 0, overflow: 'hidden' }}>
      <img src={pic(n)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
    </div>
  )
}

function Card({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  return (
    <div style={{ background: T.paper, borderRadius: R.md, padding: u(14), boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
      {children}
    </div>
  )
}

const text = (size: number, color: string = T.ink): CSSProperties => ({ fontFamily: fS, fontSize: u(size), lineHeight: 1.25, color })

// Tall left card: one outfit as a small collage, with the log button pinned to the bottom.
function Log() {
  return (
    <Card style={{ gridRow: '1 / 3' }}>
      <div style={text(14)}>today's outfit</div>
      <div style={{ ...text(12, T.g500), marginTop: u(2) }}>casual, 11°</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: u(6), marginTop: u(12) }}>
        <div style={{ gridColumn: '1 / 3' }}><Thumb n="052" h={138} /></div>
        <Thumb n="045" h={70} />
        <Thumb n="051" h={70} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: u(5), height: u(36), marginTop: 'auto', background: T.ink, borderRadius: R.md, ...text(12.5, T.paper) }}>
        <V4Icon n="plus" s={12} w={2} c={T.paper} />log
      </div>
    </Card>
  )
}

function Shop() {
  return (
    <Card>
      <div style={text(13, T.g700)}>worth buying?</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: u(10) }}>
        <Thumb n="143" size={58} />
        <div style={{ fontFamily: fD, fontSize: u(40), lineHeight: 0.9, color: T.cocoa }}>84%</div>
      </div>
      <div style={{ height: u(4), background: T.roseSoft, borderRadius: R.sm, marginTop: u(12), overflow: 'hidden' }}>
        <div style={{ width: '84%', height: '100%', background: T.cocoa }} />
      </div>
      <div style={{ ...text(12.5), marginTop: u(10) }}>yes, take it home</div>
    </Card>
  )
}

function Suggest() {
  const rows: [string, string[]][] = [['work', ['069', '053', '016']], ['dinner', ['027', '055', '014']]]
  return (
    <Card>
      <div style={text(13, T.g700)}>suggested for you</div>
      {rows.map(([name, items]) => (
        <div key={name} style={{ marginTop: u(10) }}>
          <div style={text(12)}>{name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: u(6), marginTop: u(5) }}>
            {items.map(n => <Thumb key={n} n={n} h={46} />)}
          </div>
        </div>
      ))}
    </Card>
  )
}

export function Teasers() {
  return (
    <div style={{ containerType: 'inline-size', width: '100%', maxWidth: 560 }}>
      <div role="img" aria-label="closet app: check if something is worth buying, log today's outfit, get outfit suggestions" style={{ background: T.white, borderRadius: R.lg, padding: u(16), boxSizing: 'border-box' }}>
        <div aria-hidden style={{ display: 'grid', gridTemplateColumns: '5fr 6fr', gridTemplateRows: 'auto auto', gap: u(8) }}>
          <Log />
          <Shop />
          <Suggest />
        </div>
      </div>
    </div>
  )
}

export default function LoginTeasersPage() {
  return (
    <main style={{ minHeight: '100svh', background: T.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 22px', boxSizing: 'border-box' }}>
      <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>login teasers</h1>
      <Teasers />
    </main>
  )
}
