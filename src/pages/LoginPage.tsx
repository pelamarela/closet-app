import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { MONO, UI, INK, BLUSH, RULE, UButton } from '../components/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
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

        {sent ? (
          <div style={{ border: RULE, borderRadius: 4, padding: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              // check-email
            </div>
            <div style={{ fontFamily: UI, fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Magic link sent.
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)', lineHeight: 1.5 }}>
              We sent a link to <span style={{ color: INK, fontWeight: 600 }}>{email}</span>.<br/>
              Click it to sign in — no password needed.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
              }}>
                email address <span style={{ color: '#9C5544' }}>*</span>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%', height: 44,
                  border: RULE, borderRadius: 3, padding: '0 12px',
                  fontFamily: UI, fontSize: 14, color: INK,
                  background: '#fff', outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{ fontFamily: MONO, fontSize: 10, color: '#9C5544', marginBottom: 12 }}>{error}</div>
            )}

            <UButton type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Sending…' : 'Send magic link'}
            </UButton>
          </form>
        )}
      </div>
    </div>
  )
}
