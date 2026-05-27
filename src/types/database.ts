export type Category = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory'
export type ItemStatus = 'active' | 'archived'

export interface Item {
  id: string
  name: string
  category: Category
  subcategory: string | null
  color: string | null
  pattern: string | null
  material: string | null
  warmth: number
  formality: number
  brand: string | null
  image_url: string | null
  status: ItemStatus
  created_at: string
}

export interface Outfit {
  id: string
  date_worn: string
  occasion: string | null
  weather: { temp_c: number; conditions: string } | null
  rating: number | null
  image_url: string | null
  notes: string | null
  created_at: string
}

export interface OutfitItem {
  outfit_id: string
  item_id: string
}

export interface StyleProfile {
  id: string
  description: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      items: {
        Row: Item
        Insert: Omit<Item, 'id' | 'created_at'>
        Update: Partial<Omit<Item, 'id' | 'created_at'>>
      }
      outfits: {
        Row: Outfit
        Insert: Omit<Outfit, 'id' | 'created_at'>
        Update: Partial<Omit<Outfit, 'id' | 'created_at'>>
      }
      outfit_items: {
        Row: OutfitItem
        Insert: OutfitItem
        Update: OutfitItem
      }
      style_profile: {
        Row: StyleProfile
        Insert: Omit<StyleProfile, 'id' | 'updated_at'>
        Update: Partial<Omit<StyleProfile, 'id'>>
      }
    }
  }
}
