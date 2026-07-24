import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { AppBar, UButton, MONO, UI, INK, RULE, ACCENT } from '../components/ui'
import FixedBar from '../components/FixedBar'

const MIN_LENGTH = 8

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const isValid = currentPassword.length > 0 && newPassword.length >= MIN_LENGTH && newPassword === confirmPassword

  const save = async () => {
    if (!user?.email || !isValid) return
    setSaving(true); setError(null)

    // Reauthenticate with the current password first — updateUser() would otherwise
    // let anyone with an open session change the password without proving they know it.
    const { error: reauthError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
    if (reauthError) {
      setSaving(false)
      setError('Current password is incorrect.')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (updateError) { setError(updateError.message); return }

    setDone(true)
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
  }

  const Field = ({ label, value, onChange, autoComplete }: { label: string; value: string; onChange: (v: string) => void; autoComplete: string }) => (
    <div style={{ padding: '12px 0', borderBottom: RULE }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label} <span style={{ color: ACCENT }}>*</span>
      </div>
      <input
        type="password"
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
          at least {MIN_LENGTH} characters
        </div>

        {newPassword.length > 0 && newPassword.length < MIN_LENGTH && (
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: ACCENT, marginTop: 10 }}>
            New password needs at least {MIN_LENGTH} characters.
          </div>
        )}
        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: ACCENT, marginTop: 10 }}>
            Passwords don't match.
          </div>
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
          {saving ? 'Saving…' : 'Update password'}
        </UButton>
      </FixedBar>
    </div>
  )
}
