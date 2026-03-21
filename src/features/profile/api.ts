import { supabase } from '../../lib/supabase/client'
import type { Profile } from '../../types/domain'

export type ProfileWithBarangay = Profile & {
  barangays: { name: string } | null
}

export const fetchCurrentProfile = async (): Promise<ProfileWithBarangay> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*, barangays(name)')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Profile not found')

  return data as ProfileWithBarangay
}

export const fetchBarangays = async (): Promise<Array<{ id: string; name: string }>> => {
  const { data, error } = await supabase
    .from('barangays')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Array<{ id: string; name: string }>
}

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  const extension = file.name.includes('.') ? file.name.split('.').pop() ?? 'jpg' : 'jpg'
  const filePath = `${userId}/avatar-${Date.now()}.${extension}`

  const { error } = await supabase.storage.from('profile-pictures').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from('profile-pictures').getPublicUrl(filePath)

  return publicUrl
}

export const updateMyProfile = async (payload: {
  fullName: string
  barangayId: string
  avatarUrl: string | null
}): Promise<void> => {
  const { error } = await supabase.rpc('update_my_profile', {
    p_full_name: payload.fullName,
    p_barangay_id: payload.barangayId,
    p_avatar_url: payload.avatarUrl,
  })

  if (error) throw error
}
