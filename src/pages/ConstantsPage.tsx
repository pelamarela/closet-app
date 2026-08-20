import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConstants, type ConstantWithSignedUrl } from '../hooks/useConstants'
import { useConstantMutations } from '../hooks/useConstantMutations'
import { T, fS, fM, V4Icon, V4Bar, Btn, Disp, Body, Mono } from '../design/kit'

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

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <V4Bar back title="Settings" onBack={() => navigate('/settings')} />
      <div style={{ padding: '4px 22px 0' }}>
        <Disp s={24}>Constants</Disp>
        <Body s={13} style={{ marginTop: 6 }}>Things you always wear — jewelry, watch, etc. Factored into Suggest.</Body>
      </div>

      {formOpen && (
        <div style={{ padding: '20px 22px 0' }}>
          <div style={{ boxShadow: `inset 0 0 0 1px ${T.line}`, padding: 16 }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            <button
              onClick={() => fileRef.current?.click()}
              style={{ width: 72, height: 72, boxShadow: `inset 0 0 0 1px ${T.line}`, overflow: 'hidden', cursor: 'pointer', background: T.white, border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}
            >
              {imagePreview ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <V4Icon n="cam" s={22} w={1.4} c={T.g400} />}
            </button>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Gold hoop earrings, layered necklaces, signet ring" maxLength={200}
              style={{ width: '100%', boxSizing: 'border-box', minHeight: 56, fontFamily: fS, fontSize: 14, lineHeight: 1.5, color: T.ink, background: 'none', border: 'none', outline: 'none', resize: 'none', padding: 0 }}
            />
            {error && <Body s={12} c={T.roseDeep} style={{ marginTop: 8 }}>{error}</Body>}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <Btn kind="quiet" flex={1} onClick={() => setFormOpen(false)}>Cancel</Btn>
              <Btn flex={1.4} icon="check" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add constant'}</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '22px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Mono s={11}>{constants.length} constant{constants.length !== 1 ? 's' : ''}</Mono>
        <button onClick={openAdd} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13, color: T.cocoa }}>+ Add</button>
      </div>

      {constants.length === 0 && !formOpen ? (
        <div style={{ padding: '14px 22px 0' }}>
          <Body s={13}>No constants yet — add pieces you always wear so Suggest can factor them in.</Body>
        </div>
      ) : (
        <div style={{ padding: '10px 22px 0' }}>
          {constants.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < constants.length - 1 ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ width: 44, height: 44, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
                {c.signedImageUrl && <img src={c.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0, fontFamily: fS, fontSize: 13, color: T.ink, lineHeight: 1.4 }}>{c.description}</div>
              <button onClick={() => openEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, padding: 4, flexShrink: 0, display: 'flex' }}><V4Icon n="pen" s={15} w={1.4} /></button>
              {confirmDelete === c.id ? (
                <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.roseDeep, padding: 4, flexShrink: 0, fontFamily: fS, fontSize: 12 }}>sure?</button>
              ) : (
                <button onClick={() => setConfirmDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, padding: 4, flexShrink: 0, display: 'flex' }}><V4Icon n="trash" s={15} w={1.4} /></button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
