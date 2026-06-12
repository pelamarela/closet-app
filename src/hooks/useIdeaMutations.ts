import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useIdeaMutations() {
  const { user } = useAuth()

  const saveIdea = async (
    occasion: string,
    reasoning: string,
    itemIds: string[],
    notes?: string,
  ): Promise<string> => {
    const { data: idea, error: ideaErr } = await supabase
      .from('outfit_ideas')
      .insert({
        user_id: user!.id,
        occasion: occasion?.trim() || null,
        reasoning: reasoning?.trim() || null,
        notes: notes?.trim() || null,
      })
      .select('id')
      .single()

    if (ideaErr || !idea) throw ideaErr ?? new Error('Failed to save idea')

    if (itemIds.length > 0) {
      const { error: joinErr } = await supabase
        .from('idea_items')
        .insert(itemIds.map(item_id => ({ idea_id: idea.id, item_id })))
      if (joinErr) throw joinErr
    }

    return idea.id
  }

  const deleteIdea = async (id: string): Promise<void> => {
    const { error } = await supabase.from('outfit_ideas').delete().eq('id', id)
    if (error) throw error
  }

  return { saveIdea, deleteIdea }
}
