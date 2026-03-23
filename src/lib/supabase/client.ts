import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  ?? import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Check .env values.')
}

const isBrowser = typeof window !== 'undefined'

const getTabScopedStorageKey = (): string => {
  if (!isBrowser) return 'spes-qr-att-auth-token'

  const tabIdKey = 'spes-qr-att-tab-id'
  let tabId = window.sessionStorage.getItem(tabIdKey)

  if (!tabId) {
    tabId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem(tabIdKey, tabId)
  }

  return `spes-qr-att-auth-token-${tabId}`
}

const storageKey = getTabScopedStorageKey()

export const createBrowserSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: isBrowser ? window.sessionStorage : undefined,
      storageKey,
    },
  })

export const supabase = createBrowserSupabaseClient()
