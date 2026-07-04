import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConstants, type ConstantWithSignedUrl } from '../hooks/useConstants'
import { useConstantMutations } from '../hooks/useConstantMutations'
import { AppBar, SectionLabel, UButton, Icon, MONO, UI, INK, RULE, ACCENT } from '../components/ui'
import Spinner from '../components/Spinner'

export default function ConstantsPage() {
  const navigate = useNavigate()
  const { constants, loading, refetch } = useConstants()
  const { addConstant, updateConstant, deleteConstant } = useConstantMutations()
  const fileRef = useRef<HTMLInputElement>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const openAdd = () => {
    setEditingId(null); setDescription(''); setImageFile(null); setImagePreview(null)
    setError(null); setFormOpen(true)
  }

  const openEdit = (c: ConstantWithSignedUrl) => {
    setEditingId(c.id); setDescription(c.description); setImageFile(null)
    setImagePreview(c.signedImageUrl); setError(null); setFormOpen(true)
  }

  const closeForm = () => setFormOpen(false)

  const handleFile = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!description.trim()) { setError('Add a description first.'); return }
    setSaving(true); setError(null)
    try {
      if (editingId) await updateConstant(editingId, description, imageFile ?? undefined)
      else await addConstant(description, imageFile ?? undefined)
      await refetch()
      setFormOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await deleteConstant(id)
    await refetch()
    setConfirmDelete(null)
  }

  if (loading) return <Spinner />

  return (
    <div style={{ paddingBottom: 40 }}>
      <AppBar title="Settings" back onBack={() => navigate('/settings')} />

      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Constants
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
          things you always wear — jewelry, watch, etc. · factored into suggestions
        </div>
      </div>

      {formOpen && (
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ border: RULE, padding: 14 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 72, height: 72, border: RULE, borderRadius: 3, overflow: 'hidden',
                cursor: 'pointer', background: '#ECEAE6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              {imagePreview
                ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Icon name="camera" size={22} stroke={1.3} />
              }
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Gold hoop earrings, layered necklaces, signet ring"
              maxLength={200}
              style={{
                width: '100%', minHeight: 56,
                fontFamily: UI, fontSize: 14, lineHeight: 1.5,
                color: INK, background: 'none', border: 'none', outline: 'none',
                resize: 'none', padding: 0,
              }}
            />
            {error && (
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: ACCENT, marginTop: 6 }}>{error}</div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <UButton variant="ghost" style={{ flex: 1 }} onClick={closeForm}>Cancel</UButton>
              <UButton style={{ flex: 1.4 }} icon="check" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add constant'}
              </UButton>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right={
          <button onClick={openAdd} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', padding: 0 }}>
            + add
          </button>
        }>{constants.length} constant{constants.length !== 1 ? 's' : ''}</SectionLabel>

        {constants.length === 0 && !formOpen ? (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', padding: '20px 0', lineHeight: 1.6 }}>
            no constants yet — add pieces you always wear so Suggest can factor them in
          </div>
        ) : (
          <div style={{ borderTop: RULE }}>
            {constants.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: RULE,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 3, overflow: 'hidden', flexShrink: 0,
                  border: RULE, background: '#ECEAE6',
                }}>
                  {c.signedImageUrl && (
                    <img src={c.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, fontFamily: UI, fontSize: 13, color: INK, lineHeight: 1.4 }}>
                  {c.description}
                </div>
                <button
                  onClick={() => openEdit(c)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK, padding: 4, flexShrink: 0 }}
                >
                  <Icon name="edit" size={15} stroke={1.4} />
                </button>
                {confirmDelete === c.id ? (
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, padding: 4, flexShrink: 0, fontFamily: MONO, fontSize: 9 }}
                  >
                    sure?
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(c.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)', padding: 4, flexShrink: 0 }}
                  >
                    <Icon name="trash" size={15} stroke={1.4} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
