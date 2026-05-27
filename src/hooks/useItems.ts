import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Item, Category } from '../types/database'
import { useAuth } from './useAuth'

export interface ItemWithSignedUrl extends Item {
  signedImageUrl: string | null
}

export interface ItemFormData {
  name: string
  category: Category
  subcategory: string
  color: string
  pattern: string
  material: string
  warmth: number
  formality: number
  brand: string
}

export function useItems() {
  const { user } = useAuth()
  const [items, setItems] = useState<ItemWithSignedUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

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

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return { items, loading, error, refetch: fetchItems }
}
