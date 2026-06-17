import { UI, INK, RULE } from './ui'

type Props = {
  value: string
  onChange: (v: string) => void
  presets: string[]
  showCustomInput?: boolean
}

export default function OccasionPicker({ value, onChange, presets, showCustomInput = true }: Props) {
  return (
    <>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {presets.map(o => (
          <button
            key={o}
            onClick={() => onChange(value === o ? '' : o)}
            style={{
              fontFamily: 'monospace', fontSize: 9.5, letterSpacing: '0.04em',
              padding: '5px 10px', cursor: 'pointer',
              border: `1px solid ${value === o ? INK : 'rgba(0,0,0,0.15)'}`,
              background: value === o ? INK : 'transparent',
              color: value === o ? '#fff' : INK,
              borderRadius: 2,
            }}
          >{o}</button>
        ))}
      </div>
      {showCustomInput && (
        <input
          type="text"
          value={presets.includes(value) ? '' : value}
          onChange={e => onChange(e.target.value)}
          placeholder="or type custom…"
          style={{
            marginTop: 10, width: '100%',
            fontFamily: UI, fontSize: 14, fontWeight: 500,
            color: INK, background: 'none', border: 'none', outline: 'none',
            borderBottom: RULE, padding: '6px 0',
          }}
        />
      )}
    </>
  )
}
