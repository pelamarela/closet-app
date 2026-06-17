import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItemMutations } from '../hooks/useItemMutations'
import { AppBar, SectionLabel, UButton, MONO, UI, INK, RULE } from '../components/ui'
import { catLabel } from '../lib/categoryLabel'
import Spinner from '../components/Spinner'
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
    setLoading(true)

    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'archived')
      .order('created_at', { ascending: false })

    const paths = (data ?? []).filter(i => i.image_url).map(i => i.image_url as string)
    const signedUrlMap: Record<string, string> = {}

    if (paths.length > 0) {
      const { data: signed } = await supabase.storage
        .from('item-photos')
        .createSignedUrls(paths, 3600)
      signed?.forEach(({ path, signedUrl }) => {
        if (path && signedUrl) signedUrlMap[path] = signedUrl
      })
    }

    setItems(
      (data ?? []).map(item => ({
        ...item,
        signedImageUrl: item.image_url ? (signedUrlMap[item.image_url] ?? null) : null,
      }))
    )
    setLoading(false)
  }, [user])

  useEffect(() => { fetchArchived() }, [fetchArchived])

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

  if (loading) return <Spinner />

  return (
    <div style={{ paddingBottom: 40 }}>
      <AppBar title="Archived" back onBack={() => navigate('/settings')} />

      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.06em' }}>
          // {items.length} archived item{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: UI, fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: INK }}>
            Nothing archived.
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 8 }}>
            archived items appear here — restore or delete permanently
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px 20px 0' }}>
          <SectionLabel>items</SectionLabel>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                display: 'grid', gridTemplateColumns: '48px 1fr auto',
                alignItems: 'center', gap: 12,
                paddingTop: 10, paddingBottom: 10, borderBottom: RULE,
              }}
            >
              {/* Thumbnail */}
              <div style={{ height: 60, borderRadius: 2, overflow: 'hidden', border: RULE }}>
                {item.signedImageUrl ? (
                  <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 8px, #DCD9D3 8px 16px)' }} />
                )}
              </div>

              {/* Info */}
              <div>
                <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>{item.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.45)', marginTop: 2 }}>
                  {catLabel(item.category)}{item.color ? ` · ${item.color}` : ''}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                {confirmDelete === item.id ? (
                  <>
                    <UButton
                      variant="ghost"
                      style={{ fontSize: 10, padding: '4px 8px', height: 'auto' }}
                      onClick={() => setConfirmDelete(null)}
                    >
                      Cancel
                    </UButton>
                    <UButton
                      variant="accent"
                      style={{ fontSize: 10, padding: '4px 8px', height: 'auto' }}
                      disabled={busy === item.id}
                      onClick={() => handleDelete(item.id)}
                    >
                      {busy === item.id ? '…' : 'Delete'}
                    </UButton>
                  </>
                ) : (
                  <>
                    <UButton
                      variant="ghost"
                      style={{ fontSize: 10, padding: '4px 8px', height: 'auto' }}
                      disabled={busy === item.id}
                      onClick={() => handleRestore(item.id)}
                    >
                      {busy === item.id ? '…' : 'Restore'}
                    </UButton>
                    <UButton
                      variant="secondary"
                      style={{ fontSize: 10, padding: '4px 8px', height: 'auto' }}
                      disabled={!!busy}
                      onClick={() => setConfirmDelete(item.id)}
                    >
                      Delete
                    </UButton>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
