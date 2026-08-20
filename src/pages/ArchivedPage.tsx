import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItemMutations } from '../hooks/useItemMutations'
import { catLabel } from '../lib/categoryLabel'
import { T, fS, fM, V4Bar, Pill, Disp, Body, Mono } from '../design/kit'
import type { Item } from '../types/database'

type ArchivedItem = Item & { signedImageUrl: string | null }

export default function ArchivedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restoreItem, deleteItems } = useItemMutations()

  const [items, setItems] = useState<ArchivedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchArchived = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('items').select('*').eq('user_id', user.id).eq('status', 'archived')
      .order('created_at', { ascending: false })

    const paths = (data ?? []).filter(i => i.image_url).map(i => i.image_url as string)
    const signedUrlMap: Record<string, string> = {}
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage.from('item-photos').createSignedUrls(paths, 3600)
      signed?.forEach(({ path, signedUrl }) => { if (path && signedUrl) signedUrlMap[path] = signedUrl })
    }
    setItems((data ?? []).map(item => ({ ...item, signedImageUrl: item.image_url ? (signedUrlMap[item.image_url] ?? null) : null })))
    setLoading(false)
  }, [user])

  useEffect(() => { setLoading(true); fetchArchived() }, [fetchArchived])

  const handleRestore = async (id: string) => {
    setBusy(id)
    await restoreItem(id)
    setItems(prev => prev.filter(i => i.id !== id))
    setBusy(null)
  }

  const handleDelete = async (id: string) => {
    setBusy(id)
    await deleteItems([id])
    setItems(prev => prev.filter(i => i.id !== id))
    setBusy(null)
    setConfirmDelete(null)
  }

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <V4Bar back title="Settings" onBack={() => navigate('/settings')} />
      <div style={{ padding: '4px 22px 0' }}>
        <Disp s={24}>Archived</Disp>
        <Body s={13} style={{ marginTop: 6 }}>{items.length} item{items.length !== 1 ? 's' : ''}</Body>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '30px 22px 0' }}>
          <Body s={14}>Nothing archived — items you archive from the Closet show up here to restore or delete permanently.</Body>
        </div>
      ) : (
        <div style={{ padding: '22px 22px 0' }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < items.length - 1 ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ width: 48, height: 60, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
                {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <div style={{ marginTop: 2 }}><Mono s={11}>{catLabel(item.category)}{item.color ? ` · ${item.color}` : ''}</Mono></div>
              </div>
              {confirmDelete === item.id ? (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Pill s="sm" onClick={() => setConfirmDelete(null)}>Cancel</Pill>
                  <Pill s="sm" tone="peach" on onClick={() => handleDelete(item.id)}>{busy === item.id ? '…' : 'Delete'}</Pill>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Pill s="sm" onClick={() => handleRestore(item.id)}>{busy === item.id ? '…' : 'Restore'}</Pill>
                  <Pill s="sm" onClick={() => setConfirmDelete(item.id)}>Delete</Pill>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
