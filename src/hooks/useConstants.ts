import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Constant } from '../types/database'
import { useAuth } from './useAuth'

export interface ConstantWithSignedUrl extends Constant {
  signedImageUrl: string | null
}

export function useConstants() {
  const { user } = useAuth()
  const [constants, setConstants] = useState<ConstantWithSignedUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConstants = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('constants')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const paths = (data ?? []).filter(c => c.image_url).map(c => c.image_url as string)
    const signedUrlMap: Record<string, string> = {}

    if (paths.length > 0) {
      const { data: signed } = await supabase.storage
        .from('item-photos')
        .createSignedUrls(paths, 3600)
      signed?.forEach(({ path, signedUrl }) => {
        if (path && signedUrl) signedUrlMap[path] = signedUrl
      })
    }

    setConstants(
      (data ?? []).map(c => ({
        ...c,
        signedImageUrl: c.image_url ? (signedUrlMap[c.image_url] ?? null) : null,
      }))
    )
    setLoading(false)
  }, [user])

  useEffect(() => { fetchConstants() }, [fetchConstants])

  return { constants, loading, error, refetch: fetchConstants }
}
