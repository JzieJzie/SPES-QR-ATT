import { supabase } from '../../lib/supabase/client'
import type { Profile } from '../../types/domain'

type ManageableRole = 'leader' | 'co-leader' | 'developer'

export type ScopedUser = Profile & {
  barangay_name: string | null
}

export const fetchUsers = async (): Promise<ScopedUser[]> => {
  const { data, error } = await supabase.rpc('list_users_scoped')
  if (error) throw error
  return (data ?? []) as ScopedUser[]
}

export const setUserRole = async (userId: string, role: ManageableRole): Promise<void> => {
  const { error } = await supabase.rpc('set_user_role', {
    p_user_id: userId,
    p_role: role,
  })

  if (error) throw error
}

export type LeaderDirectoryRecord = {
  id: string
  full_name: string | null
  role: 'leader' | 'co-leader'
  program_batch: 'batch1' | 'batch2' | null
  barangay_name: string | null
  avatar_url: string | null
}

export const fetchLeaderDirectory = async (): Promise<LeaderDirectoryRecord[]> => {
  const { data, error } = await supabase.rpc('list_leader_directory')
  if (error) throw error
  return (data ?? []) as LeaderDirectoryRecord[]
}
