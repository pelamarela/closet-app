import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, Pill, Btn, Body, Mono } from '../design/kit'
import { Teasers } from './LoginTeasersPage'
import { LoginRail, RotatingHeadline } from './LoginRail'

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

// Desktop: a clothes rail runs across the top (LoginRail), the form sits below it.
// Phone: the form with the teaser cards underneath.
// `teaser` is only passed by the local dev options page and no longer changes anything here.
export default function LoginPage(props: { teaser?: string }) {
  void props
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
      setError("passwords don't match.")
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
        setError('account created — check your email to confirm it before signing in.')
        setMode('signin'); setConfirmPassword('')
      } else {
        setError('account created — you can now sign in.')
        setMode('signin'); setConfirmPassword('')
      }
      setLoading(false)
    }
  }

  const isInfo = error?.startsWith('account')

  const Footer = (
    <div style={{ padding: '18px 0', textAlign: 'center' }}>
      <Mono s={10.5} c={T.g400}>pelamarela closet app v3.0, powered by AI, made with 🤍</Mono>
    </div>
  )

  const content = (
    <>
      <div style={{ padding: '36px 22px 0', display: 'flex', justifyContent: 'center' }}>
        <img src="/logo.png" alt="pelamarela" style={{ width: 88, height: 88, objectFit: 'contain', display: 'block' }} />
      </div>

      <div style={{ padding: '22px 22px 0', textAlign: 'center' }}>
        <RotatingHeadline size={34} />
      </div>

      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}><Pill group="login" s="lg" full on={mode === 'signin'} onClick={() => { setMode('signin'); setError(null); setConfirmPassword('') }}>sign in</Pill></div>
          <div style={{ flex: 1 }}><Pill group="login" s="lg" full on={mode === 'signup'} onClick={() => { setMode('signup'); setError(null); setConfirmPassword('') }}>create account</Pill></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '22px 22px 28px' }}>
        <Field label="email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="password" type="password" value={password} onChange={setPassword} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
        {mode === 'signup' && (
          <Body s={11.5} style={{ marginTop: 8 }}>at least 8 characters, with uppercase, lowercase, a digit, and a symbol.</Body>
        )}

        {mode === 'signup' && (
          <div style={{ marginTop: 18 }}>
            <Field label="confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Body s={11.5} c={T.roseDeep} style={{ marginTop: 8 }}>passwords don't match.</Body>
            )}
          </div>
        )}

        {error && (
          <Body s={12.5} c={isInfo ? T.cocoa : T.roseDeep} style={{ marginTop: 18 }}>{error}</Body>
        )}

        <div style={{ marginTop: 22 }}>
          <Btn type="submit" full disabled={loading || (mode === 'signup' && password !== confirmPassword)}>
            {loading ? 'please wait…' : mode === 'signin' ? 'sign in' : 'create account'}
          </Btn>
        </div>
      </form>

      {!isDesktop && (
        <div style={{ padding: '0 22px 28px', display: 'flex', justifyContent: 'center' }}>
          <Teasers />
        </div>
      )}
    </>
  )

  if (isDesktop) {
    return (
      <div style={{ minHeight: '100svh', background: T.paper, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '210px 0 0', boxSizing: 'border-box' }}>
        <LoginRail />
        <div style={{ width: 430, position: 'relative', zIndex: 10 }}>
          {content}
          {Footer}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100svh', background: T.paper, maxWidth: 430, margin: '0 auto' }}>
      {content}
      {Footer}
    </div>
  )
}
