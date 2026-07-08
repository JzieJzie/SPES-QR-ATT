import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from './query-client'
import { ThemeProvider } from '../lib/theme/ThemeContext'
import { useSupabaseKeepAlive } from '../hooks/useSupabaseKeepAlive'

const SupabaseKeepAliveWrapper = ({ children }: PropsWithChildren) => {
  useSupabaseKeepAlive()
  return <>{children}</>
}

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SupabaseKeepAliveWrapper>
          {children}
        </SupabaseKeepAliveWrapper>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
