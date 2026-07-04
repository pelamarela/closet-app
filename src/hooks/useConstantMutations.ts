import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/imageUtils'
import { useAuth } from './useAuth'

export function useConstantMutations() {
  const { user } = useAuth()

  const uploadImage = async (file: File): Promise<string> => {
    const compressed = await compressImage(file)
    const path = `${user!.id}/constants/${crypto.randomUUID()}.jpg`
    const { error } = await supabase.storage
      .from('item-photos')
      .upload(path, compressed, { contentType: 'image/jpeg' })
    if (error) throw error
    return path
  }

  const addConstant = async (description: string, imageFile?: File): Promise<void> => {
    let image_url: string | null = null
    if (imageFile) image_url = await uploadImage(imageFile)

    const { error } = await supabase.from('constants').insert({
      user_id: user!.id,
      description: description.trim(),
      image_url,
    })
    if (error) throw error
  }

  const updateConstant = async (id: string, description: string, imageFile?: File): Promise<void> => {
    const patch: { description: string; image_url?: string } = { description: description.trim() }
    if (imageFile) patch.image_url = await uploadImage(imageFile)

    const { error } = await supabase.from('constants').update(patch).eq('id', id)
    if (error) throw error
  }

  const deleteConstant = async (id: string): Promise<void> => {
    const { error } = await supabase.from('constants').delete().eq('id', id)
    if (error) throw error
  }

  return { addConstant, updateConstant, deleteConstant }
}
