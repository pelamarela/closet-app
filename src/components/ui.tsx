// Utility design system primitives shared across all screens.

export const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace'
export const UI = "'Geist', 'Inter', system-ui, sans-serif"
export const RULE = '1px solid rgba(0,0,0,0.10)'
export const RULE_DASHED = '1px dashed rgba(0,0,0,0.18)'
export const INK = '#0A0A0A'
export const BLUSH = '#DFAFA1'
export const BG = '#F7F6F5'

// "// section ------" label with dashed rule extending right.
export function SectionLabel({
  children,
  right,
}: {
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

// Small monospace tag/pill. Filled = ink bg, white text.
export function MonoTag({
  children,
  filled = false,
  accent = false,
}: {
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
      border: `1px solid ${accent ? '#9C5544' : (filled ? INK : 'rgba(0,0,0,0.15)')}`,
      background: filled ? INK : (accent ? 'rgba(220,175,160,0.15)' : 'transparent'),
      color: filled ? '#fff' : (accent ? '#9C5544' : INK),
      borderRadius: 2,
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
    }}>{children}</span>
  )
}

// Primary action button — 48px tall, 4px radius.
export function UButton({
  children,
  variant = 'primary',
  onClick,
  disabled,
  type = 'button',
  style: extra,
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  style?: React.CSSProperties
}) {
  const v = {
    primary:   { bg: INK, color: '#fff', border: 'none' },
    secondary: { bg: 'transparent', color: INK, border: `1px solid ${INK}` },
    ghost:     { bg: 'transparent', color: INK, border: '1px solid rgba(0,0,0,0.15)' },
    accent:    { bg: BLUSH, color: INK, border: 'none' },
  }[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 48, padding: '0 20px',
        background: v.bg, color: v.color, border: v.border,
        borderRadius: 4, cursor: disabled ? 'default' : 'pointer',
        fontFamily: UI, fontSize: 13, fontWeight: 600,
        letterSpacing: '-0.005em',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.15s',
        WebkitTapHighlightColor: 'transparent',
        ...extra,
      }}
    >
      {children}
    </button>
  )
}

// Scale picker (1-5) used for warmth / formality — filled bar segments.
export function ScalePicker({
  label,
  hint,
  value,
  onChange,
  required,
}: {
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
        <span>
          {label}{required && <span style={{ color: '#9C5544', marginLeft: 3 }}>*</span>}
        </span>
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

// Thin horizontal rule.
export function Rule({ style }: { style?: React.CSSProperties }) {
  return <div style={{ borderTop: RULE, ...style }} />
}
