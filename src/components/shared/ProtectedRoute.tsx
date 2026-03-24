import { Navigate, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'

import { hasRole, useAuth } from '../../hooks/useAuth'
import type { AppRole } from '../../types/domain'

type ProtectedRouteProps = {
  allowedRoles: readonly AppRole[]
  children?: ReactNode
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { userId, profile, isLoading, authError } = useAuth()

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center font-mono">Loading...</div>
  }

  if (!userId) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-white dark:bg-black p-4">
        <div className="max-w-xl border-2 border-black dark:border-white bg-white dark:bg-black p-4 shadow-brutal dark:shadow-brutal-dark text-black dark:text-white">
          <h1 className="mb-2 text-lg font-heading uppercase">Account Setup Required</h1>
          <p className="text-sm">
            {authError ?? 'Your account does not have a profile role yet. Please contact a leader.'}
          </p>
        </div>
      </div>
    )
  }

  if (!hasRole(profile.role, allowedRoles)) {
    return <Navigate to="/" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
