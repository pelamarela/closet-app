import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, dotted, Pill, Btn, Disp, Body, V4Card } from '../design/kit'

type Mode = 'signin' | 'signup'

function Field({ label, type, value, onChange, autoComplete }: {
  label: string; type: string; value: string; onChange: (v: string) => void; autoComplete: string
}) {
  return (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${T.line}` }}>
      <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500, marginBottom: 4 }}>{label}</div>
      <input
        type={type} required autoComplete={autoComplete} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', fontFamily: fS, fontSize: 15, color: T.ink, background: 'none', border: 'none', outline: 'none', padding: 0 }}
      />
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { isDesktop } = useBreakpoint()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'signup' && password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setLoading(true)

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
        setError('Account created — check your email to confirm it before signing in.')
        setMode('signin'); setConfirmPassword('')
      } else {
        setError('Account created — you can now sign in.')
        setMode('signin'); setConfirmPassword('')
      }
      setLoading(false)
    }
  }

  const isInfo = error?.startsWith('Account')

  const content = (
    <>
      <div style={{ padding: '36px 22px 0', display: 'flex', justifyContent: 'center' }}>
        <img src="/logo.png" alt="closet" style={{ width: 108, height: 108, objectFit: 'contain', display: 'block' }} />
      </div>

      <div style={{ padding: '22px 22px 0', textAlign: 'center' }}>
        <Disp s={34} style={{ lineHeight: 1.1 }}>Your closet,<br />on every device.</Disp>
      </div>

      <div style={{ padding: '28px 22px 0' }}>
        <div style={{ ...dotted, height: 80, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', padding: '0 18px' }}>
          <img src="/brand/wave.png" alt="" style={{ width: 46, opacity: .95, display: 'block' }} />
        </div>
      </div>

      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}><Pill s="lg" on={mode === 'signin'} onClick={() => { setMode('signin'); setError(null); setConfirmPassword('') }}>Sign in</Pill></div>
          <div style={{ flex: 1 }}><Pill s="lg" on={mode === 'signup'} onClick={() => { setMode('signup'); setError(null); setConfirmPassword('') }}>Create account</Pill></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '22px 22px 28px' }}>
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
        {mode === 'signup' && (
          <Body s={11.5} style={{ marginTop: 8 }}>At least 8 characters, with uppercase, lowercase, a digit, and a symbol.</Body>
        )}

        {mode === 'signup' && (
          <div style={{ marginTop: 18 }}>
            <Field label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Body s={11.5} c={T.roseDeep} style={{ marginTop: 8 }}>Passwords don't match.</Body>
            )}
          </div>
        )}

        {error && (
          <Body s={12.5} c={isInfo ? T.cocoa : T.roseDeep} style={{ marginTop: 18 }}>{error}</Body>
        )}

        <div style={{ marginTop: 22 }}>
          <Btn type="submit" full disabled={loading || (mode === 'signup' && password !== confirmPassword)}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Btn>
        </div>
      </form>
    </>
  )

  if (isDesktop) {
    return (
      <div style={{ minHeight: '100svh', background: T.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 430 }}>
          <V4Card pad={0} style={{ overflow: 'hidden' }}>{content}</V4Card>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100svh', background: T.paper, maxWidth: 430, margin: '0 auto' }}>
      {content}
    </div>
  )
}
