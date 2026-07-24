import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { AppBar, UButton, MONO, UI, INK, RULE, ACCENT } from '../components/ui'
import FixedBar from '../components/FixedBar'

const MIN_LENGTH = 8
// Matches the project's Auth setting: "Lowercase, uppercase letters, digits and symbols"
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/
const PASSWORD_HINT = `At least ${MIN_LENGTH} characters, with uppercase, lowercase, a digit, and a symbol.`

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
        setError('That code is wrong or expired — check your email for the latest one.')
        return
      }
      setError(updateError.message)
      return
    }

    setDone(true)
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setNonce(''); setNeedsNonce(false)
  }

  const Field = ({ label, value, onChange, autoComplete, type = 'password' }: { label: string; value: string; onChange: (v: string) => void; autoComplete: string; type?: string }) => (
    <div style={{ padding: '12px 0', borderBottom: RULE }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label} <span style={{ color: ACCENT }}>*</span>
      </div>
      <input
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={e => { onChange(e.target.value); setDone(false) }}
        style={{
          width: '100%', background: 'none', border: 'none', outline: 'none',
          fontFamily: MONO, fontSize: 16, fontWeight: 500, color: INK,
          marginTop: 6, padding: 0,
        }}
      />
    </div>
  )

  return (
    <div style={{ paddingBottom: 100 }}>
      <AppBar title="Settings" back onBack={() => navigate('/settings')} meta={done ? 'saved' : undefined} />

      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Change password
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
          you'll need your current password to confirm
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <Field label="current password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
        <Field label="new password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
        <Field label="confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', marginTop: 8 }}>
          {PASSWORD_HINT}
        </div>

        {needsNonce && (
          <div style={{ marginTop: 14 }}>
            <Field label="confirmation code" value={nonce} onChange={setNonce} autoComplete="one-time-code" type="text" />
          </div>
        )}

        {newPassword.length > 0 && !passwordStrongEnough && (
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: ACCENT, marginTop: 10 }}>
            {PASSWORD_HINT}
          </div>
        )}
        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: ACCENT, marginTop: 10 }}>
            Passwords don't match.
          </div>
        )}
        {info && (
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: INK, marginTop: 10 }}>{info}</div>
        )}
        {error && (
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: ACCENT, marginTop: 10 }}>{error}</div>
        )}
        {done && (
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: '#2a7a4b', marginTop: 10 }}>
            Password updated.
          </div>
        )}
      </div>

      <FixedBar zIndex={10}>
        <UButton variant="ghost" style={{ flex: 1 }} onClick={() => navigate('/settings')}>Cancel</UButton>
        <UButton style={{ flex: 1.4 }} icon="check" disabled={saving || !isValid} onClick={save}>
          {saving ? 'Saving…' : needsNonce ? 'Confirm & update' : 'Update password'}
        </UButton>
      </FixedBar>
    </div>
  )
}
