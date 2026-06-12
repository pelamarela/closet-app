import { useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../hooks/useBreakpoint'

export const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace'
export const UI = "'Geist', 'Inter', system-ui, sans-serif"
export const RULE = '1px solid rgba(0,0,0,0.10)'
export const RULE_STRONG = '1px solid rgba(0,0,0,0.18)'
export const RULE_DASHED = '1px dashed rgba(0,0,0,0.18)'
export const INK = '#0A0A0A'
export const BLUSH = '#DFAFA1'
export const CREAM = '#F2E1D0'
export const BG = '#F7F6F5'
export const ACCENT = '#9C5544'

export function Icon({ name, size = 20, stroke = 1.5 }: {
  name: string; size?: number; stroke?: number
}) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24' as const,
    fill: 'none' as const, stroke: 'currentColor' as const, strokeWidth: stroke,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    style: { display: 'block' as const, flexShrink: 0 as const },
  }
  switch (name) {
    case 'hanger':   return <svg {...p}><path d="M12 8a2 2 0 1 1 2-2"/><path d="M12 8v2"/><path d="M3 18l9-6 9 6"/><path d="M3 18h18"/></svg>
    case 'plus':     return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>
    case 'calendar': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
    case 'spark':    return <svg {...p}><path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/></svg>
    case 'search':   return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    case 'filter':   return <svg {...p}><path d="M3 6h18M6 12h12M10 18h4"/></svg>
    case 'more':     return <svg {...p}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>
    case 'back':     return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>
    case 'forward':  return <svg {...p}><path d="M9 18l6-6-6-6"/></svg>
    case 'check':    return <svg {...p}><path d="M5 12l5 5 9-11"/></svg>
    case 'archive':  return <svg {...p}><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 13h4"/></svg>
    case 'trash':    return <svg {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
    case 'edit':     return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
    case 'user':     return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    case 'x':        return <svg {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>
    case 'grid':     return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    case 'list':     return <svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
    case 'sun':      return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>
    case 'cloud':    return <svg {...p}><path d="M7 18a4 4 0 1 1 .9-7.9A6 6 0 0 1 19 12a4 4 0 0 1-.7 8z"/></svg>
    case 'camera':   return <svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
    case 'home':     return <svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
    case 'bookmark':    return <svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'thumbs-up':   return <svg {...p}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
    case 'thumbs-down': return <svg {...p}><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
    default:            return null
  }
}

export function TopBar({ title, meta }: {
  title: React.ReactNode
  meta?: React.ReactNode
}) {
  const navigate = useNavigate()
  const { isDesktop } = useBreakpoint()
  return (
    <div>
      <div style={{
        padding: '4px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: UI, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
          color: INK, minWidth: 0,
        }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" style={{ width: 18, height: 18, display: 'block' }} alt="home" />
          </button>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {meta && (
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)' }}>{meta}</div>
          )}
          {!isDesktop && (
            <button
              onClick={() => navigate('/settings')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK, padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <Icon name="user" size={18} stroke={1.5} />
            </button>
          )}
        </div>
      </div>
      <div style={{ borderTop: RULE, margin: '12px 20px 0' }} />
    </div>
  )
}

export function AppBar({ title, back = false, onBack, right, meta }: {
  title: React.ReactNode
  back?: boolean
  onBack?: () => void
  right?: React.ReactNode
  meta?: React.ReactNode
}) {
  const navigate = useNavigate()
  return (
    <div>
      <div style={{
        padding: '4px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" style={{ width: 18, height: 18, display: 'block' }} alt="home" />
          </button>
          <button
            onClick={back ? (onBack ?? (() => navigate(-1))) : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: UI, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
              color: INK, background: 'none', border: 'none',
              cursor: back ? 'pointer' : 'default', padding: 0,
            }}
          >
            {back && <Icon name="back" size={16} stroke={1.6} />}
            {title}
          </button>
        </div>
        {meta && !right && (
          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)' }}>{meta}</div>
        )}
        {right}
      </div>
      <div style={{ borderTop: RULE, margin: '12px 20px 0' }} />
    </div>
  )
}

const OUTFIT_SWATCHES: [string, string][] = [
  ['#F2E1D0', '#E4CDB8'],  // cream
  ['#DFAFA1', '#CE9C8E'],  // blush
  ['#F7F6F5', '#E8E7E6'],  // off-white
  ['#1A1A1A', '#000000'],  // black
]

export function outfitSwatch(id: string): [string, string] {
  const n = parseInt(id.replace(/-/g, '').slice(0, 6), 16)
  return OUTFIT_SWATCHES[n % OUTFIT_SWATCHES.length]
}

export function SectionLabel({ children, right }: {
  children: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
      <div style={{
        fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)',
        textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap' as const,
      }}>// {children}</div>
      <div style={{ flex: 1, borderTop: RULE_DASHED }} />
      {right && (
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', whiteSpace: 'nowrap' as const }}>
          {right}
        </div>
      )}
    </div>
  )
}

export function MonoKV({ k, v, accent = false }: {
  k: string; v: React.ReactNode; accent?: boolean
}) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 10, lineHeight: 1.4 }}>
      <span style={{ color: 'rgba(0,0,0,0.45)' }}>{k} </span>
      <span style={{ color: accent ? ACCENT : INK, fontWeight: 600 }}>{v}</span>
    </div>
  )
}

export function MonoTag({ children, filled = false, accent = false }: {
  children: React.ReactNode
  filled?: boolean
  accent?: boolean
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: MONO, fontSize: 9.5,
      letterSpacing: '0.04em', textTransform: 'lowercase' as const,
      padding: '3px 6px',
      border: `1px solid ${accent ? ACCENT : (filled ? INK : 'rgba(0,0,0,0.15)')}`,
      background: filled ? INK : (accent ? 'rgba(220,175,160,0.15)' : 'transparent'),
      color: filled ? '#fff' : (accent ? ACCENT : INK),
      borderRadius: 2,
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
    }}>{children}</span>
  )
}

export function UButton({ children, variant = 'primary', icon, full, onClick, disabled, type = 'button', style: extra }: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent'
  icon?: string
  full?: boolean
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  style?: React.CSSProperties
}) {
  const v = {
    primary:   { bg: INK,           color: '#fff', border: 'none' },
    secondary: { bg: 'transparent', color: INK,   border: `1px solid ${INK}` },
    ghost:     { bg: 'transparent', color: INK,   border: '1px solid rgba(0,0,0,0.15)' },
    accent:    { bg: BLUSH,         color: INK,   border: 'none' },
  }[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: full ? '100%' : undefined,
        height: 48, padding: '0 20px',
        background: v.bg, color: v.color, border: v.border,
        borderRadius: 4, cursor: disabled ? 'default' : 'pointer',
        fontFamily: UI, fontSize: 13, fontWeight: 600,
        letterSpacing: '-0.005em',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: disabled ? 0.4 : 1,
        WebkitTapHighlightColor: 'transparent',
        ...extra,
      }}
    >
      {icon && <Icon name={icon} size={15} stroke={2} />}
      {children}
    </button>
  )
}

export function ScalePicker({ label, hint, value, onChange, required }: {
  label: string
  hint?: string
  value: number
  onChange: (v: number) => void
  required?: boolean
}) {
  return (
    <div style={{ padding: '12px 0', borderBottom: RULE }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
        textTransform: 'uppercase' as const, letterSpacing: '0.08em',
      }}>
        <span>{label}{required && <span style={{ color: ACCENT, marginLeft: 3 }}>*</span>}</span>
        <span style={{ color: INK }}>{value} / 5</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              flex: 1, height: 28,
              border: `1px solid ${n <= value ? INK : 'rgba(0,0,0,0.15)'}`,
              background: n <= value ? INK : 'transparent',
              color: n <= value ? '#fff' : 'rgba(0,0,0,0.35)',
              borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MONO, fontSize: 11, fontWeight: 600,
              cursor: 'pointer',
            }}
          >{n}</button>
        ))}
      </div>
      {hint && (
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.35)', marginTop: 5 }}>{hint}</div>
      )}
    </div>
  )
}

export function Rule({ style }: { style?: React.CSSProperties }) {
  return <div style={{ borderTop: RULE, ...style }} />
}

const MAIN_CATS = new Set(['top', 'bottom', 'one-piece', 'outerwear'])
const short = (name: string) => name.split(' ').slice(0, 2).join(' ')

export function outfitTitle(
  itemIds: string[],
  allItems: { id: string; name: string; category: string }[],
  fallback = 'outfit'
): string {
  const picked = allItems.filter(i => itemIds.includes(i.id))
  if (!picked.length) return fallback
  const sorted = [
    ...picked.filter(i => MAIN_CATS.has(i.category)),
    ...picked.filter(i => !MAIN_CATS.has(i.category)),
  ]
  if (sorted.length === 1) return sorted[0].name
  if (sorted.length === 2) return `${short(sorted[0].name)} · ${short(sorted[1].name)}`
  return `${short(sorted[0].name)} + ${sorted.length - 1} more`
}
