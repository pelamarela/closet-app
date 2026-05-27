import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Outfit } from '../types/database'

export type OutfitWithItems = Outfit & {
  item_ids: string[]
}

export function useOutfits() {
  const { user } = useAuth()
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOutfits = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('outfits')
      .select('*, outfit_items(item_id)')
      .eq('user_id', user.id)
      .order('date_worn', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setOutfits(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any[] ?? []).map((o: any) => ({
        ...o,
        item_ids: (o.outfit_items ?? []).map((oi: { item_id: string }) => oi.item_id),
        outfit_items: undefined,
      }))
    )
    setLoading(false)
  }, [user])

  useEffect(() => { fetchOutfits() }, [fetchOutfits])

  return { outfits, loading, error, refetch: fetchOutfits }
}
