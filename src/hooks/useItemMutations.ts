import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/imageUtils'
import { useAuth } from './useAuth'
import type { ItemFormData } from './useItems'

export function useItemMutations() {
  const { user } = useAuth()

  const uploadImage = async (file: File): Promise<string> => {
    const compressed = await compressImage(file)
    const path = `${user!.id}/${crypto.randomUUID()}.jpg`
    const { error } = await supabase.storage
      .from('item-photos')
      .upload(path, compressed, { contentType: 'image/jpeg' })
    if (error) throw error
    return path
  }

  const toNull = (s: string) => s.trim() || null

  const addItem = async (data: ItemFormData, imageFile?: File): Promise<void> => {
    let image_url: string | null = null
    if (imageFile) image_url = await uploadImage(imageFile)

    const { error } = await supabase.from('items').insert({
      name: data.name.trim(),
      category: data.category,
      subcategory: toNull(data.subcategory),
      color: toNull(data.color),
      pattern: toNull(data.pattern),
      material: toNull(data.material),
      warmth: data.warmth,
      formality: data.formality,
      brand: toNull(data.brand),
      image_url,
      status: 'active',
      user_id: user!.id,
    })
    if (error) throw error
  }

  const updateItem = async (id: string, data: ItemFormData, imageFile?: File): Promise<void> => {
    const patch: Record<string, unknown> = {
      name: data.name.trim(),
      category: data.category,
      subcategory: toNull(data.subcategory),
      color: toNull(data.color),
      pattern: toNull(data.pattern),
      material: toNull(data.material),
      warmth: data.warmth,
      formality: data.formality,
      brand: toNull(data.brand),
    }
    if (imageFile) patch.image_url = await uploadImage(imageFile)

    const { error } = await supabase.from('items').update(patch).eq('id', id)
    if (error) throw error
  }

  const archiveItem = async (id: string): Promise<void> => {
    const { error } = await supabase.from('items').update({ status: 'archived' }).eq('id', id)
    if (error) throw error
  }

  return { addItem, updateItem, archiveItem }
}
