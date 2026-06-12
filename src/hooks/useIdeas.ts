import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { OutfitIdeaWithItems } from '../types/database'

export function useIdeas() {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState<OutfitIdeaWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIdeas = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('outfit_ideas')
      .select('*, idea_items(item_id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setIdeas(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any[] ?? []).map((idea: any) => ({
        ...idea,
        item_ids: (idea.idea_items ?? []).map((ii: { item_id: string }) => ii.item_id),
        idea_items: undefined,
      }))
    )
    setLoading(false)
  }, [user])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  return { ideas, loading, error, refetch: fetchIdeas }
}
