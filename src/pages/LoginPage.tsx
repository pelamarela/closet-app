import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MONO, UI, INK, CREAM, RULE, ACCENT } from '../components/ui'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        navigate('/')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (!data.session) {
        // Email confirmation is required — signUp() succeeds but doesn't return a
        // session until the user clicks the link in the confirmation email.
        setError('Account created — check your email to confirm it before signing in.')
        setMode('signin')
      } else {
        setError('Account created — you can now sign in.')
        setMode('signin')
      }
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100svh', background: '#F7F6F5', maxWidth: 430, margin: '0 auto' }}>
      {/* Brand header */}
      <div style={{ padding: '4px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: UI, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', color: INK }}>
          <img src="/logo.png" style={{ width: 24, height: 24, display: 'block' }} alt="closet" />
          closet
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginLeft: 4 }}>v2.1.0</span>
        </div>
      </div>
      <div style={{ borderTop: RULE, margin: '12px 20px 0' }} />

      {/* Hero text */}
      <div style={{ padding: '50px 20px 0' }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          // welcome back
        </div>
        <div style={{ fontFamily: UI, fontSize: 44, lineHeight: 1, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 14 }}>
          Your closet,<br />
          on every<br />
          device.
        </div>
      </div>

      {/* Striped visual block */}
      <div style={{
        margin: '32px 20px 0', height: 80,
        background: `repeating-linear-gradient(135deg, ${CREAM} 0 16px, #E8D3BD 16px 32px)`,
        border: RULE,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: 10,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          your wardrobe
        </span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          v 2.1.0
        </span>
      </div>

      {/* Mode toggle */}
      <div style={{ margin: '24px 20px 0', display: 'flex', border: RULE, overflow: 'hidden' }}>
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

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '0 20px' }}>
        {/* Email */}
        <div style={{ padding: '12px 0', borderBottom: RULE }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            email <span style={{ color: ACCENT }}>*</span>
          </div>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              fontFamily: MONO, fontSize: 16, fontWeight: 500, color: INK,
              marginTop: 6, padding: 0,
            }}
          />
        </div>

        {/* Password */}
        <div style={{ padding: '12px 0', borderBottom: RULE, marginBottom: 18 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            password <span style={{ color: ACCENT }}>*</span>
          </div>
          <input
            type="password"
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              fontFamily: MONO, fontSize: 16, fontWeight: 500, color: INK,
              marginTop: 6, padding: 0,
            }}
          />
          {mode === 'signup' && (
            <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', marginTop: 8 }}>
              At least 8 characters, with uppercase, lowercase, a digit, and a symbol.
            </div>
          )}
        </div>

        {error && (
          <div style={{
            fontFamily: MONO, fontSize: 10, marginBottom: 12,
            color: error.startsWith('Account') ? '#2a7a4b' : ACCENT,
            padding: '8px 10px',
            border: `1px solid ${error.startsWith('Account') ? 'rgba(42,122,75,0.3)' : 'rgba(156,85,68,0.3)'}`,
          }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', height: 48, padding: '0 20px',
            background: INK, color: '#fff', border: 'none',
            borderRadius: 4, cursor: loading ? 'default' : 'pointer',
            fontFamily: UI, fontSize: 13, fontWeight: 600,
            letterSpacing: '-0.005em',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

    </div>
  )
}
