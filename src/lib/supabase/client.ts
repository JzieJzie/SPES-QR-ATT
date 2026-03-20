import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  ?? import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Check .env values.')
}

export const createBrowserSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

export const supabase = createBrowserSupabaseClient()
