// Design v3 (Pelamarela) kit — ported from design-materials/v3/design_handoff/source/v4-kit.jsx.
// Names are kept close to the reference file (T, fD/fS/fM, V4Icon, Ph, OutfitThumb, Btn, Pill, …)
// so later phases can adapt the other v4-*.jsx reference screens with minimal translation risk.
// This is the v3 replacement for components/ui.tsx — pages migrate to it one at a time.

import { useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'

// Fixed height of the persistent app header (design/Layout.tsx) — pages that
// need their own sticky sub-header (below it, not fighting it for top:0) use
// this as their `top` offset.
export const APP_HEADER_H = 58

// Desktop content column width (design/Layout.tsx). Fixed-position footers
// on individual pages center their own inner wrapper to this same value so
// their buttons stay aligned under the content column above them.
export const CONTENT_MAX_W = 1200

export const T = {
  paper: '#F7F6F5', white: '#FFFFFF', ink: '#000000',
  peach: '#F2E1D0', peachSoft: '#FAF2EA', peachDeep: '#E9CBB0',
  rose: '#DFAFA1', roseSoft: '#ECCFC4', roseDeep: '#C98E7C',
  cocoa: '#6F4E37', cocoaSoft: '#8A6B54', cocoaDeep: '#543A29',
  line: '#E6E3E0', g700: '#2B2B29', g500: '#5A5854', g400: '#8A8884', g200: '#D9D6D2',
} as const

export const fD = '"Syne", system-ui, sans-serif'
export const fS = '"Poppins", system-ui, sans-serif'
export const fM = '"Space Mono", ui-monospace, monospace'

export const dotted: CSSProperties = {
  backgroundColor: T.paper,
  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.13) 1px, transparent 1.4px)',
  backgroundSize: '22px 22px',
}

// Real hover/active/disabled feedback for every button, round button and pill —
// injected once so it matches the design system reference exactly. See
// design-materials/v3/design_handoff/source/v4-kit.jsx for the source of truth.
if (typeof document !== 'undefined' && !document.getElementById('ds-v3-interactive-css')) {
  const st = document.createElement('style')
  st.id = 'ds-v3-interactive-css'
  st.textContent = `.ds-btn{transition:background .15s ease,transform .08s ease,border-color .15s ease}.ds-btn-primary:hover:not(:disabled){background:#2b2b29}.ds-btn-primary:active:not(:disabled){background:#000;transform:scale(.97)}.ds-btn-peach:hover:not(:disabled){background:${T.peachDeep}}.ds-btn-peach:active:not(:disabled){background:${T.peachDeep};transform:scale(.97)}.ds-btn-quiet:hover:not(:disabled){background:rgba(0,0,0,.045);border-color:${T.g400}}.ds-btn-quiet:active:not(:disabled){background:rgba(0,0,0,.08);transform:scale(.97)}.ds-btn-white:hover:not(:disabled){background:${T.paper}}.ds-btn-white:active:not(:disabled){background:${T.g200};transform:scale(.97)}.ds-btn:disabled{opacity:.38;cursor:not-allowed}.ds-round{transition:background .15s ease,transform .08s ease}.ds-round-quiet:hover:not(:disabled){background:rgba(0,0,0,.045)}.ds-round-peach:hover:not(:disabled){background:${T.peachDeep}}.ds-round:active:not(:disabled){transform:scale(.94)}.ds-round:disabled{opacity:.38;cursor:not-allowed}.ds-pill{cursor:pointer;transition:border-color .15s ease,background .15s ease,transform .08s ease}.ds-pill:not(.ds-pill-on):hover{border-color:${T.g400}}.ds-pill:not(.ds-pill-on):active{background:rgba(0,0,0,.05);transform:scale(.97)}.ds-pill.ds-pill-on:active{transform:scale(.97);opacity:.85}.ds-tile{cursor:pointer;transition:box-shadow .15s ease,transform .08s ease}.ds-tile:hover{box-shadow:inset 0 0 0 1.5px ${T.g400}}.ds-tile:active{transform:scale(.97)}.ds-row4{cursor:pointer;transition:background .15s ease;margin:0 -12px;padding-left:12px;padding-right:12px}.ds-row4:hover{background:rgba(0,0,0,.03)}.ds-dd-trig{cursor:pointer;display:inline-flex;align-items:center;gap:5px}.ds-dd-opt{cursor:pointer;transition:background .12s ease}.ds-dd-opt:hover{background:rgba(0,0,0,.04)}`
  document.head.appendChild(st)
}

export type IconName =
  | 'home' | 'hanger' | 'bulb' | 'user' | 'plus' | 'check' | 'back' | 'next' | 'close'
  | 'spark' | 'cal' | 'sun' | 'heart' | 'search' | 'more' | 'up' | 'down' | 'box'
  | 'archive' | 'pen' | 'cam' | 'link' | 'chart' | 'grid' | 'list' | 'repeat'
  | 'caret' | 'bookmark' | 'trash' | 'bag' | 'thumbs-up' | 'thumbs-down'

const ICON_PATHS: Record<IconName, string> = {
  home: 'M4 11l8-6.5L20 11M6.5 9.4V19h11V9.4',
  hanger: 'M12 7.5a2 2 0 1 1 2-2M12 7.5v2M3.5 17.5 12 11.5l8.5 6M4 17.5h16',
  bulb: 'M9 18h6M10 21h4M8 13a4.6 4.6 0 1 1 8 0c-.7 1.1-1 1.9-1 3H9c0-1.1-.3-1.9-1-3Z',
  user: 'M12 11.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8ZM5.5 20a6.5 6.5 0 0 1 13 0',
  plus: 'M12 5.5v13M5.5 12h13',
  check: 'M5 12.5l4.5 4.5L19 6.5',
  back: 'M15 5.5 8.5 12 15 18.5',
  next: 'M9 5.5 15.5 12 9 18.5',
  close: 'M6 6l12 12M18 6 6 18',
  spark: 'M12 3.5l1.7 5.3 5.3 1.7-5.3 1.7L12 17.5l-1.7-5.3L5 10.5l5.3-1.7zM18.5 16.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z',
  cal: 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 3.5v4M15.5 3.5v4',
  sun: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4',
  heart: 'M12 19.5s-6.8-4.2-6.8-9.2A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 6.8 2.7c0 5-6.8 9.2-6.8 9.2Z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16.2 16.2 20.5 20.5',
  more: 'M12 5.6v.1M12 12v.1M12 18.4v.1',
  up: 'M6.5 11.5V20H4v-8.5zM6.5 11.5 10 4a2 2 0 0 1 2 2v4h4.8a2 2 0 0 1 2 2.3l-.9 4.4A2 2 0 0 1 16 20H6.5',
  down: 'M17.5 12.5V4H20v8.5zM17.5 12.5 14 20a2 2 0 0 1-2-2v-4H7.2a2 2 0 0 1-2-2.3l.9-4.4A2 2 0 0 1 8 4h8',
  box: 'M4 5.5h16v3.5H4zM5.5 9v10h13V9M10 13h4',
  archive: 'M4 5.5h16v3.5H4zM5.5 9v10h13V9M9.5 13.2h5',
  pen: 'M4.5 19.5h4L20 8a2.1 2.1 0 0 0-3-3L5.5 16.5zM15.5 6.5 18.5 9.5',
  cam: 'M4 8.5h3l1.5-2h7L17 8.5h3v11H4zM12 17a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z',
  link: 'M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.5-1.5',
  chart: 'M5 19V11M12 19V5M19 19v-6M3.5 19h17',
  grid: 'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
  list: 'M4 7h16M4 12h16M4 17h11',
  repeat: 'M5 9.5V8a2.5 2.5 0 0 1 2.5-2.5h9M19 14.5V16a2.5 2.5 0 0 1-2.5 2.5h-9M16 2.5 19 5.5 16 8.5M8 15.5 5 18.5 8 21.5',
  caret: 'M5.5 9 12 15.5 18.5 9',
  bookmark: 'M6.5 4.5h11v15l-5.5-3.8-5.5 3.8z',
  trash: 'M5 7.5h14M9.5 7.5V5.3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7.5M7 7.5 7.8 19a1.4 1.4 0 0 0 1.4 1.3h5.6A1.4 1.4 0 0 0 16.2 19l.8-11.5M10.2 11v6M13.8 11v6',
  bag: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  'thumbs-up': 'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3',
  'thumbs-down': 'M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17',
}

export function V4Icon({ n, s = 22, w = 1.6, c, style }: {
  n: IconName; s?: number; w?: number; c?: string; style?: CSSProperties
}) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c ?? 'currentColor'}
      strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={ICON_PATHS[n]} />
    </svg>
  )
}

// Soft two-tone placeholder — stands in for a real photo when an item has none.
// `crop` documents how a real photo would be framed: clothing shot on a
// hanger/person crops from the top, flat product shots (bags, fragrance) crop
// from the center — encoded as a background-position shift on the pattern.
export type PhTone = 'peach' | 'rose' | 'cocoa' | 'ink' | 'sand' | 'paper'

const PH_TONES: Record<PhTone, [string, string, 0 | 1]> = {
  peach: ['#F5E7DA', '#EAD8C4', 0], rose: ['#E7C6BA', '#DAB0A1', 0],
  cocoa: ['#7C5B44', '#61452F', 1], ink: ['#2C2925', '#1A1815', 1],
  sand: ['#EDEAE5', '#DFDAD3', 0], paper: ['#F4F2EF', '#E8E4DE', 0],
}
const TONE_CYCLE: PhTone[] = ['peach', 'rose', 'cocoa', 'ink', 'sand', 'paper']

// Deterministic tone per id — used where a real photo collage would be too
// small to read (week strip, month calendar cells): same outfit always
// shows the same color, different outfits are visually distinct at a glance.
export function outfitTone(id: string): PhTone {
  const n = parseInt(id.replace(/-/g, '').slice(0, 6), 16) || 0
  return TONE_CYCLE[n % TONE_CYCLE.length]
}

export function Ph({ tone = 'sand', label, crop, style }: {
  tone?: PhTone; label?: string; crop?: 'top' | 'center'; style?: CSSProperties
}) {
  const p = PH_TONES[tone]
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      backgroundImage: `repeating-linear-gradient(122deg, ${p[0]} 0 18px, ${p[1]} 18px 36px)`,
      backgroundPosition: crop === 'top' ? '0 0' : '50% 50%', ...style,
    }}>
      {label && (
        <div style={{ position: 'absolute', left: 8, bottom: 7, fontFamily: fM, fontSize: 9, letterSpacing: '.02em', color: p[2] ? 'rgba(255,255,255,.82)' : 'rgba(0,0,0,.5)' }}>{label}</div>
      )}
    </div>
  )
}

// Real item photo, or the Ph placeholder while there isn't one yet.
export function ItemPhoto({ src, alt = '', tone = 'sand', crop, style }: {
  src?: string | null; alt?: string; tone?: PhTone; crop?: 'top' | 'center'; style?: CSSProperties
}) {
  if (src) {
    return <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: crop === 'top' ? 'top' : 'center', display: 'block', ...style }} />
  }
  return <Ph tone={tone} crop={crop} style={style} />
}

// Closet grid tile — real photo (falls back to the Ph placeholder), optional
// worn-count badge, optional selected ring/check for pick flows.
export function ItemTile({ src, alt = '', tone = 'sand', crop, worn, sel, onClick }: {
  src?: string | null; alt?: string; tone?: PhTone; crop?: 'top' | 'center'
  worn?: number; sel?: boolean; onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="ds-tile" style={{
      position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden', padding: 0,
      background: 'none', cursor: 'pointer',
      boxShadow: sel ? `0 0 0 2.5px ${T.ink}` : `inset 0 0 0 1px ${T.line}`,
    }}>
      <ItemPhoto src={src} alt={alt} tone={tone} crop={crop} />
      {worn != null && (
        <div style={{ position: 'absolute', right: 6, bottom: 6, height: 20, padding: '0 7px', borderRadius: 2, background: 'rgba(247,246,245,.92)', display: 'flex', alignItems: 'center', fontFamily: fM, fontSize: 10, fontWeight: 700 }}>{worn}×</div>
      )}
      {sel && (
        <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, background: T.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><V4Icon n="check" s={13} w={2.6} /></div>
      )}
    </button>
  )
}

export function Disp({ children, s = 28, w = 600, c = T.ink, style }: {
  children: ReactNode; s?: number; w?: number; c?: string; style?: CSSProperties
}) {
  const head = s >= 24
  return (
    <div style={{
      fontFamily: head ? fD : fS, fontSize: s, fontWeight: head ? w : Math.min(w, 500),
      lineHeight: head ? 1.12 : 1.32, letterSpacing: head ? '-.015em' : '-.005em',
      color: c, textWrap: 'pretty', ...style,
    }}>{children}</div>
  )
}
export function Body({ children, s = 14, c = T.g500, style }: {
  children: ReactNode; s?: number; c?: string; style?: CSSProperties
}) {
  return <div style={{ fontFamily: fS, fontSize: s, lineHeight: 1.6, color: c, textWrap: 'pretty', ...style }}>{children}</div>
}
export function Mono({ children, s = 11, c = T.g400, style }: {
  children: ReactNode; s?: number; c?: string; style?: CSSProperties
}) {
  return <span style={{ fontFamily: fM, fontSize: s, color: c, letterSpacing: '.01em', ...style }}>{children}</span>
}
export function SecH({ children, right, onRightClick, style }: {
  children: ReactNode; right?: ReactNode; onRightClick?: () => void; style?: CSSProperties
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, ...style }}>
      <div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 500, color: T.ink }}>{children}</div>
      {right && (
        <button onClick={onRightClick} disabled={!onRightClick} style={{
          background: 'none', border: 'none', padding: 0, cursor: onRightClick ? 'pointer' : 'default',
          fontFamily: fS, fontSize: 13, color: T.cocoa, display: 'flex', alignItems: 'center', gap: 3,
        }}>{right}<V4Icon n="next" s={14} w={2} /></button>
      )}
    </div>
  )
}

// Contextual bar under the persistent header — back button + title + right-side icon(s).
// Sticky by default (pinned just below the app header) so every page's own
// header behaves like the Closet page's — the design system's baseline, not
// an opt-in per page.
export function V4Bar({ title, back, onBack, right, pad = 22, sticky = true }: {
  title?: ReactNode; back?: boolean; onBack?: () => void; right?: ReactNode; pad?: number; sticky?: boolean
}) {
  return (
    <div style={{
      height: 44, padding: `0 ${pad}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: T.ink,
      ...(sticky ? { position: 'sticky' as const, top: 'var(--v3-header-h)', zIndex: 25, background: T.paper } : {}),
    }}>
      {back ? (
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6, marginLeft: -6, background: 'none', border: 'none',
          padding: '4px 6px', cursor: 'pointer', fontFamily: fS, fontSize: 14, fontWeight: 500, color: T.ink,
        }}><V4Icon n="back" s={20} w={1.7} />{title}</button>
      ) : (
        <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500 }}>{title}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>{right}</div>
    </div>
  )
}

export function Pill({ children, on = false, tone = 'ink', count, s = 'md', full = false, onClick }: {
  children: ReactNode; on?: boolean; tone?: 'ink' | 'peach'; count?: number | string
  s?: 'sm' | 'md' | 'lg'; full?: boolean; onClick?: () => void
}) {
  const h = s === 'lg' ? 46 : s === 'sm' ? 34 : 40
  const bg = on ? (tone === 'peach' ? T.peach : T.ink) : 'transparent'
  const fg = on ? (tone === 'peach' ? T.ink : '#fff') : T.g700
  return (
    <button onClick={onClick} className={`ds-pill${on ? ' ds-pill-on' : ''}`} style={{
      height: h, width: full ? '100%' : undefined, display: 'inline-flex', alignItems: 'center', justifyContent: full ? 'center' : 'flex-start', gap: 6, padding: `0 ${s === 'sm' ? 13 : 17}px`,
      borderRadius: 2, background: bg, color: fg, border: on ? 'none' : `1px solid ${T.g200}`,
      fontFamily: fS, fontSize: s === 'sm' ? 12.5 : 14, fontWeight: 400, whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {children}{count != null && <span style={{ fontFamily: fM, fontSize: 11, opacity: .55 }}>{count}</span>}
    </button>
  )
}

export type BtnKind = 'primary' | 'peach' | 'quiet' | 'white'
const BTN_KIND: Record<BtnKind, CSSProperties> = {
  primary: { background: T.ink, color: '#fff', border: 'none' },
  peach: { background: T.peach, color: T.ink, border: 'none' },
  quiet: { background: 'transparent', color: T.ink, border: `1px solid ${T.g200}` },
  white: { background: T.white, color: T.ink, border: 'none' },
}

export function Btn({ children, kind = 'primary', icon, full, flex, disabled = false, type = 'button', onClick, style }: {
  children: ReactNode; kind?: BtnKind; icon?: IconName; full?: boolean; flex?: number
  disabled?: boolean; type?: 'button' | 'submit'; onClick?: () => void; style?: CSSProperties
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`ds-btn ds-btn-${kind}`} style={{
      height: 52, padding: '0 22px', borderRadius: 2, cursor: disabled ? 'not-allowed' : 'pointer',
      width: full ? '100%' : undefined, flex, fontFamily: fS, fontSize: 14.5, fontWeight: 400,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      WebkitTapHighlightColor: 'transparent', ...BTN_KIND[kind], ...style,
    }}>
      {icon && <V4Icon n={icon} s={19} w={1.9} />}{children}
    </button>
  )
}

export function RoundBtn({ icon, tone = 'quiet', disabled = false, onClick, style }: {
  icon: IconName; tone?: 'quiet' | 'peach'; disabled?: boolean; onClick?: () => void; style?: CSSProperties
}) {
  const k: CSSProperties = tone === 'peach' ? { background: T.peach, border: 'none' } : { background: 'transparent', border: `1px solid ${T.g200}` }
  return (
    <button disabled={disabled} onClick={onClick} className={`ds-round ds-round-${tone}`} style={{
      width: 52, height: 52, padding: 0, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, cursor: disabled ? 'not-allowed' : 'pointer', WebkitTapHighlightColor: 'transparent', ...k, ...style,
    }}><V4Icon n={icon} s={21} w={1.7} /></button>
  )
}

// Subtle section separator — full-bleed hairline within the page's padded column.
export function Divider({ style }: { style?: CSSProperties }) {
  return <div style={{ height: 1, background: T.line, margin: '26px 22px 0', ...style }} />
}

export function V4Card({ children, fill = T.white, pad = 16, shadow = true, style }: {
  children: ReactNode; fill?: string; pad?: number; shadow?: boolean; style?: CSSProperties
}) {
  return <div style={{ background: fill, borderRadius: 0, padding: pad, boxShadow: shadow ? '0 2px 10px rgba(0,0,0,.045)' : 'none', ...style }}>{children}</div>
}

export function Row4({ label, value, chev = true, sub, last, onClick }: {
  label: ReactNode; value?: ReactNode; chev?: boolean; sub?: ReactNode; last?: boolean; onClick?: () => void
}) {
  const content = (
    <>
      <div><div style={{ fontFamily: fS, fontSize: 15 }}>{label}</div>{sub && <div style={{ fontFamily: fS, fontSize: 12, color: T.g400, marginTop: 1 }}>{sub}</div>}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.g400 }}>
        {value != null && <span style={{ fontFamily: fM, fontSize: 12.5 }}>{value}</span>}
        {chev && <V4Icon n="next" s={16} w={1.8} />}
      </div>
    </>
  )
  const rowStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 54, borderBottom: last ? 'none' : `1px solid ${T.line}`, width: '100%' }
  if (onClick) {
    return <button className="ds-row4" onClick={onClick} style={{ ...rowStyle, background: 'none', border: 'none', borderBottom: rowStyle.borderBottom, textAlign: 'left', cursor: 'pointer', padding: '0 12px', margin: '0 -12px' }}>{content}</button>
  }
  return <div className="ds-row4" style={rowStyle}>{content}</div>
}

// Bottom sheet over a dimmed screen — used for Log, Suggest brief, Shop check.
export function Scrim({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.34)', zIndex: 40 }}>
      {children}
    </div>
  )
}
export function Sheet({ children, title, right, step, maxHeight = '92svh', onClick }: {
  children: ReactNode; title?: ReactNode; right?: ReactNode; step?: [number, number]
  maxHeight?: string | number; onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <div onClick={onClick} style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, maxHeight, background: T.paper,
      boxShadow: '0 -14px 40px rgba(0,0,0,.16)', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 41,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, flexShrink: 0 }}><div style={{ width: 40, height: 4, borderRadius: 2, background: T.g200 }} /></div>
      {(title || right) && (
        <div style={{ padding: '12px 22px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>{title}{step && <div style={{ marginTop: 8 }}><Dots n={step[1]} i={step[0] - 1} /></div>}</div>
          <div style={{ paddingTop: 4 }}>{right}</div>
        </div>
      )}
      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  )
}
export function Dots({ n = 3, i = 0 }: { n?: number; i?: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: n }, (_, k) => (
        <div key={k} style={{ width: k === i ? 20 : 6, height: 6, borderRadius: 2, background: k === i ? T.ink : T.g200 }} />
      ))}
    </div>
  )
}

// Visual bar encoding instead of a mono number in a row.
export function BarStat({ label, v, max = 100, suffix = '%', tone = T.cocoa, thumbSrc }: {
  label: string; v: number; max?: number; suffix?: string; tone?: string; thumbSrc?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0' }}>
      {thumbSrc !== undefined && <div style={{ width: 34, height: 42, flexShrink: 0 }}><ItemPhoto src={thumbSrc} /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: fS, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
          <Mono s={12} c={T.ink} style={{ fontWeight: 700, paddingLeft: 10 }}>{v}{suffix}</Mono>
        </div>
        <div style={{ height: 6, borderRadius: 2, background: T.g200 }}><div style={{ width: `${(v / max) * 100}%`, height: 6, borderRadius: 2, background: tone }} /></div>
      </div>
    </div>
  )
}
// 5-dot scale — replaces "warmth 2 / 5" mono text.
export function DotScale({ v, n = 5, tone = T.cocoa }: { v: number; n?: number; tone?: string }) {
  return <div style={{ display: 'flex', gap: 4 }}>{Array.from({ length: n }, (_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: 2, background: i < v ? tone : T.g200 }} />)}</div>
}

// Trigger + options panel for time-grain and rail-style pickers.
export function Dropdown<Opt extends string>({ value, options, onChange, align = 'right', size = 'md' }: {
  value: Opt; options: Opt[]; onChange: (v: Opt) => void; align?: 'left' | 'right'; size?: 'sm' | 'md'
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)} className="ds-dd-trig" style={{
        background: 'none', border: 'none', padding: 0, fontFamily: fS, fontSize: size === 'sm' ? 13 : 14,
        fontWeight: 600, color: T.ink,
      }}>
        {value}<V4Icon n="caret" s={16} w={2.2} style={open ? { transform: 'rotate(180deg)' } : undefined} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', [align]: 0, minWidth: 168, background: T.white,
          boxShadow: '0 10px 28px rgba(0,0,0,.14)', border: `1px solid ${T.line}`, overflow: 'hidden', zIndex: 10,
        }}>
          {options.map((o, i) => (
            <button key={o} onClick={() => { onChange(o); setOpen(false) }} className="ds-dd-opt" style={{
              width: '100%', textAlign: 'left', background: o === value ? T.peachSoft : 'transparent', border: 'none',
              padding: '12px 16px', fontFamily: fS, fontSize: 14, fontWeight: o === value ? 600 : 400, color: T.ink,
              borderBottom: i < options.length - 1 ? `1px solid ${T.line}` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
            }}>{o}{o === value && <V4Icon n="check" s={15} w={2.2} />}</button>
          ))}
        </div>
      )}
    </div>
  )
}
