import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/imageUtils'
import { useAuth } from './useAuth'

export type OutfitFormData = {
  date_worn: string
  occasion: string
  rating: number | null
  notes: string
}

export function useOutfitMutations() {
  const { user } = useAuth()

  const uploadOutfitPhoto = async (file: File): Promise<string> => {
    const compressed = await compressImage(file)
    const path = `${user!.id}/outfits/${crypto.randomUUID()}.jpg`
    const { error } = await supabase.storage
      .from('item-photos')
      .upload(path, compressed, { contentType: 'image/jpeg' })
    if (error) throw error
    return path
  }

  const logOutfit = async (
    data: OutfitFormData,
    itemIds: string[],
    imageFile?: File,
  ): Promise<string> => {
    let image_url: string | null = null
    if (imageFile) image_url = await uploadOutfitPhoto(imageFile)

    const { data: outfit, error: outfitErr } = await supabase
      .from('outfits')
      .insert({
        user_id: user!.id,
        date_worn: data.date_worn,
        occasion: data.occasion?.trim() || null,
        rating: data.rating,
        notes: data.notes?.trim() || null,
        image_url,
        weather: null,
      })
      .select('id')
      .single()

    if (outfitErr || !outfit) throw outfitErr ?? new Error('Failed to create outfit')

    if (itemIds.length > 0) {
      const { error: joinErr } = await supabase
        .from('outfit_items')
        .insert(itemIds.map(item_id => ({ outfit_id: outfit.id, item_id })))
      if (joinErr) throw joinErr
    }

    return outfit.id
  }

  const updateOutfit = async (
    id: string,
    data: OutfitFormData,
    itemIds: string[],
    imageFile?: File,
  ): Promise<void> => {
    const patch: Record<string, unknown> = {
      date_worn: data.date_worn,
      occasion: data.occasion?.trim() || null,
      rating: data.rating,
      notes: data.notes?.trim() || null,
    }
    if (imageFile) patch.image_url = await uploadOutfitPhoto(imageFile)

    const { error } = await supabase.from('outfits').update(patch).eq('id', id)
    if (error) throw error

    const { error: delErr } = await supabase.from('outfit_items').delete().eq('outfit_id', id)
    if (delErr) throw delErr

    if (itemIds.length > 0) {
      const { error: joinErr } = await supabase
        .from('outfit_items')
        .insert(itemIds.map(item_id => ({ outfit_id: id, item_id })))
      if (joinErr) throw joinErr
    }
  }

  const deleteOutfit = async (id: string): Promise<void> => {
    const { error } = await supabase.from('outfits').delete().eq('id', id)
    if (error) throw error
  }

  return { logOutfit, updateOutfit, deleteOutfit }
}
