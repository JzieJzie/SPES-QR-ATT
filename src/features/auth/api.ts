import { supabase } from '../../lib/supabase/client'

export type RegisterPayload = {
  email: string
  password: string
  fullName: string
  role: 'leader' | 'co-leader'
  barangayName: string
  leaderAccessCode?: string
  avatarBase64?: string
  avatarMimeType?: string
}

export const registerAccount = async (payload: RegisterPayload): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('register-account', {
    body: {
      ...payload,
      appUrl: window.location.origin,
    },
  })

  if (error) throw error
  if (!data?.message) {
    throw new Error('Unable to register account right now.')
  }

  return String(data.message)
}

export const verifyAccount = async (token: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('verify-account', {
    body: { token },
  })

  if (error) throw error
  if (!data?.message) {
    throw new Error('Unable to verify account.')
  }

  return String(data.message)
}
