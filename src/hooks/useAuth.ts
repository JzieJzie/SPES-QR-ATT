import { useEffect, useMemo, useState } from 'react'

import { supabase } from '../lib/supabase/client'
import type { AppRole, Profile } from '../types/domain'

type AuthState = {
  userId: string | null
  profile: Profile | null
  isLoading: boolean
  authError: string | null
}

export const useAuth = (): AuthState => {
  const [state, setState] = useState<AuthState>({
    userId: null,
    profile: null,
    isLoading: true,
    authError: null,
  })

  useEffect(() => {
    let mounted = true

    const boot = async () => {
      const { data } = await supabase.auth.getSession()
      const userId = data.session?.user.id ?? null

      if (!userId) {
        if (!mounted) return
        setState({ userId: null, profile: null, isLoading: false, authError: null })
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const authError = profileError
        ? 'Profile access failed. Ensure database migrations and RLS setup are applied.'
        : !profile
          ? 'No profile found for this account. Ask a leader to provision your role.'
          : null

      if (!mounted) return
      setState({
        userId,
        profile: (profile ?? null) as Profile | null,
        isLoading: false,
        authError,
      })
    }

    void boot()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void boot()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return useMemo(() => state, [state])
}

export const hasRole = (
  role: AppRole,
  allowedRoles: readonly AppRole[],
): boolean => allowedRoles.includes(role)
