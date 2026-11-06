import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { supabaseMock } from './supabaseMock'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
}

// DEV only: ?mock=1 swaps in fake data (see supabaseMock.ts), ?mock=0 switches it off again.
if (import.meta.env.DEV && typeof location !== 'undefined') {
  const q = new URLSearchParams(location.search).get('mock')
  if (q === '1') localStorage.setItem('closet:mock', '1')
  if (q === '0') localStorage.removeItem('closet:mock')
}
const useMock = import.meta.env.DEV && typeof localStorage !== 'undefined' && localStorage.getItem('closet:mock') === '1'

export const supabase: ReturnType<typeof createClient<Database>> = useMock ? supabaseMock : createClient<Database>(supabaseUrl, supabaseAnonKey)
