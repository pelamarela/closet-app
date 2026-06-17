import { MONO } from './ui'

export default function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</span>
    </div>
  )
}
