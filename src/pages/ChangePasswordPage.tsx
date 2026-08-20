import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { T, fS, V4Bar, Btn, Disp, Body } from '../design/kit'

const MIN_LENGTH = 8
// Matches the project's Auth setting: "Lowercase, uppercase letters, digits and symbols"
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/
const PASSWORD_HINT = `At least ${MIN_LENGTH} characters, with uppercase, lowercase, a digit, and a symbol.`

// Hoisted out of the page component: an inline definition would give it a new
// function identity on every render, remounting the underlying <input> and
// killing focus/in-progress autofill after a single character.
function Field({ label, value, onChange, autoComplete, type = 'password' }: {
  label: string; value: string; onChange: (v: string) => void; autoComplete: string; type?: string
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500, marginBottom: 6 }}>{label}</div>
      <input
        type={type} required autoComplete={autoComplete} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', fontFamily: fS, fontSize: 15, color: T.ink, background: 'none', border: 'none', outline: 'none', borderBottom: `1px solid ${T.line}`, padding: '4px 0 8px' }}
      />
    </div>
  )
}

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nonce, setNonce] = useState('')
  const [needsNonce, setNeedsNonce] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const passwordStrongEnough = newPassword.length >= MIN_LENGTH && STRONG_PASSWORD.test(newPassword)
  const isValid = currentPassword.length > 0 && passwordStrongEnough && newPassword === confirmPassword
    && (!needsNonce || nonce.trim().length > 0)

  const setField = (setter: (v: string) => void) => (v: string) => { setter(v); setDone(false) }

  const save = async () => {
    if (!user?.email || !isValid) return
    setSaving(true); setError(null); setInfo(null)

    // current_password is validated server-side because "Require current password
    // when updating" is enabled. If the session is older than 24h, "Secure password
    // change" also requires a one-time code (nonce) emailed via reauthenticate().
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
      ...(needsNonce && nonce.trim() ? { nonce: nonce.trim() } : {}),
    })
    setSaving(false)

    if (updateError) {
      if (updateError.code === 'reauthentication_needed' || updateError.code === 'reauth_nonce_missing') {
        const { error: reauthError } = await supabase.auth.reauthenticate()
        if (reauthError) { setError(reauthError.message); return }
        setNeedsNonce(true)
        setInfo('A confirmation code was just emailed to you — enter it below and hit Update again.')
        return
      }
      if (updateError.code === 'reauthentication_not_valid') {
        setError("That code is wrong or expired — check your email for the latest one.")
        return
      }
      setError(updateError.message)
      return
    }

    setDone(true)
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setNonce(''); setNeedsNonce(false)
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <V4Bar back title="Settings" onBack={() => navigate('/settings')} />
      <div style={{ padding: '4px 22px 0' }}>
        <Disp s={24}>Change password</Disp>
        <Body s={13} style={{ marginTop: 6 }}>You'll need your current password to confirm.</Body>
      </div>

      <form onSubmit={e => { e.preventDefault(); save() }} style={{ padding: '22px 22px 0' }}>
        <Field label="Current password" value={currentPassword} onChange={setField(setCurrentPassword)} autoComplete="current-password" />
        <Field label="New password" value={newPassword} onChange={setField(setNewPassword)} autoComplete="new-password" />
        <Field label="Confirm new password" value={confirmPassword} onChange={setField(setConfirmPassword)} autoComplete="new-password" />
        <Body s={11.5}>{PASSWORD_HINT}</Body>

        {needsNonce && (
          <div style={{ marginTop: 18 }}>
            <Field label="Confirmation code" value={nonce} onChange={setField(setNonce)} autoComplete="one-time-code" type="text" />
          </div>
        )}

        {newPassword.length > 0 && !passwordStrongEnough && (
          <Body s={12} c={T.roseDeep} style={{ marginTop: 12 }}>{PASSWORD_HINT}</Body>
        )}
        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
          <Body s={12} c={T.roseDeep} style={{ marginTop: 12 }}>Passwords don't match.</Body>
        )}
        {info && <Body s={12} c={T.cocoa} style={{ marginTop: 12 }}>{info}</Body>}
        {error && <Body s={12} c={T.roseDeep} style={{ marginTop: 12 }}>{error}</Body>}
        {done && <Body s={12} c={T.cocoa} style={{ marginTop: 12 }}>Password updated.</Body>}

        {/* Submit lives inside the form so Enter and password-manager "fill & submit"
            affordances work, but stays visually pinned via the fixed footer. */}
        <div style={{ position: 'fixed', bottom: 'var(--v3-sticky-bottom)', left: 'var(--v3-sidenav-w)', right: 0, padding: '14px 22px 20px', background: 'rgba(247,246,245,.96)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.line}` }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 10 }}>
            <Btn kind="quiet" flex={1} type="button" onClick={() => navigate('/settings')}>Cancel</Btn>
            <Btn flex={1.4} icon="check" type="submit" disabled={saving || !isValid}>
              {saving ? 'Saving…' : needsNonce ? 'Confirm & update' : 'Update password'}
            </Btn>
          </div>
        </div>
      </form>
    </div>
  )
}
