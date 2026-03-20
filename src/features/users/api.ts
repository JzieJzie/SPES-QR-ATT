import { supabase } from '../../lib/supabase/client'
import type { Profile } from '../../types/domain'

export const fetchUsers = async (): Promise<Profile[]> => {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at')
  if (error) throw error
  return (data ?? []) as Profile[]
}

export const setUserRole = async (userId: string, role: 'admin' | 'scanner'): Promise<void> => {
  const { error } = await supabase.rpc('set_user_role', {
    p_user_id: userId,
    p_role: role,
  })

  if (error) throw error
}
