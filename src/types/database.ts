export type Category = 'top' | 'bottom' | 'one-piece' | 'outerwear' | 'shoes' | 'accessory'
export type ItemStatus = 'active' | 'archived'

export type Item = {
  id: string
  user_id: string
  name: string
  category: Category
  subcategory: string | null
  color: string | null
  pattern: string | null
  material: string | null
  warmth: number
  formality: number
  sport: boolean
  brand: string | null
  image_url: string | null
  status: ItemStatus
  created_at: string
}

export type ItemInsert = {
  user_id: string
  name: string
  category: Category
  warmth: number
  formality: number
  sport?: boolean | null
  status: ItemStatus
  subcategory?: string | null
  color?: string | null
  pattern?: string | null
  material?: string | null
  brand?: string | null
  image_url?: string | null
}

export type ItemUpdate = {
  name?: string
  category?: Category
  subcategory?: string | null
  color?: string | null
  pattern?: string | null
  material?: string | null
  warmth?: number
  formality?: number
  sport?: boolean | null
  brand?: string | null
  image_url?: string | null
  status?: ItemStatus
}

export type Outfit = {
  id: string
  user_id: string
  date_worn: string
  occasion: string | null
  weather: { temp_c: number; conditions: string } | null
  rating: number | null
  image_url: string | null
  notes: string | null
  created_at: string
}

export type OutfitItem = {
  outfit_id: string
  item_id: string
}

export type OutfitIdea = {
  id: string
  user_id: string
  occasion: string | null
  reasoning: string | null
  notes: string | null
  created_at: string
}

export type OutfitIdeaWithItems = OutfitIdea & { item_ids: string[] }

export type StyleProfile = {
  id: string
  user_id: string
  description: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      items: {
        Row: Item
        Insert: ItemInsert
        Update: ItemUpdate
        Relationships: []
      }
      outfits: {
        Row: Outfit
        Insert: Omit<Outfit, 'id' | 'created_at'>
        Update: Partial<Omit<Outfit, 'id' | 'created_at'>>
        Relationships: []
      }
      outfit_items: {
        Row: OutfitItem
        Insert: OutfitItem
        Update: OutfitItem
        Relationships: []
      }
      style_profile: {
        Row: StyleProfile
        Insert: Omit<StyleProfile, 'id' | 'updated_at'>
        Update: Partial<Omit<StyleProfile, 'id'>>
        Relationships: []
      }
      outfit_ideas: {
        Row: OutfitIdea
        Insert: Omit<OutfitIdea, 'id' | 'created_at'>
        Update: Partial<Omit<OutfitIdea, 'id' | 'created_at'>>
        Relationships: []
      }
      idea_items: {
        Row: { idea_id: string; item_id: string }
        Insert: { idea_id: string; item_id: string }
        Update: { idea_id: string; item_id: string }
        Relationships: []
      }
      suggestion_feedback: {
        Row: { id: string; user_id: string; occasion: string | null; item_ids: string[]; feedback: 'up' | 'down'; created_at: string }
        Insert: { id: string; user_id: string; occasion?: string | null; item_ids: string[]; feedback: 'up' | 'down' }
        Update: { feedback?: 'up' | 'down' }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
