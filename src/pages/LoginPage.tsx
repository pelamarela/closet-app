import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { MONO, UI, INK, BLUSH, RULE, UButton } from '../components/ui'

type Mode = 'signin' | 'signup'

function Field({ label, type, value, onChange }: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
      }}>
        {label} <span style={{ color: '#9C5544' }}>*</span>
      </div>
      <input
        type={type}
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', height: 44,
          border: RULE, borderRadius: 3, padding: '0 12px',
          fontFamily: UI, fontSize: 14, color: INK,
          background: '#fff', outline: 'none',
        }}
      />
    </div>
  )
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100svh', background: '#F7F6F5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Mark */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, background: BLUSH,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 8, height: 8, background: INK }} />
            </div>
            <span style={{ fontFamily: UI, fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em' }}>closet</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            your personal wardrobe — v0.1
          </div>
        </div>

        <div style={{ borderTop: RULE, marginBottom: 28 }} />

        {/* Mode toggle */}
        <div style={{ display: 'flex', marginBottom: 24, border: RULE, borderRadius: 3, overflow: 'hidden' }}>
          {(['signin', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null) }}
              style={{
                flex: 1, height: 36,
                background: mode === m ? INK : 'transparent',
                color: mode === m ? '#fff' : 'rgba(0,0,0,0.5)',
                border: 'none', cursor: 'pointer',
                fontFamily: MONO, fontSize: 9.5,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              {m === 'signin' ? 'sign in' : 'create account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="email address" type="email" value={email} onChange={setEmail} />
          <Field label="password" type="password" value={password} onChange={setPassword} />

          {error && (
            <div style={{ fontFamily: MONO, fontSize: 10, color: '#9C5544', marginBottom: 12 }}>{error}</div>
          )}

          <UButton type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </UButton>
        </form>
      </div>
    </div>
  )
}
