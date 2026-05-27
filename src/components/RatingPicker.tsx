import { MONO, INK } from './ui'

interface RatingPickerProps {
  value: number
  onChange: (v: number) => void
  label: string
  hint?: string
}

export default function RatingPicker({ value, onChange, label, hint }: RatingPickerProps) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.10)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span>{label} <span style={{ color: '#9C5544' }}>*</span></span>
        <span style={{ color: INK }}>{value} / 5</span>
      </div>
      {hint && (
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.35)', marginTop: 4 }}>{hint}</div>
      )}
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
    </div>
  )
}
