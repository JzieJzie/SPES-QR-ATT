import { useEffect } from 'react'
import { supabase } from '../lib/supabase/client'

/**
 * Hook to keep the Supabase connection active by sending periodic heartbeat pings.
 * This prevents connection timeouts due to inactivity.
 * @param intervalMs - Interval in milliseconds between heartbeat pings (default: 5 minutes)
 */
export const useSupabaseKeepAlive = (intervalMs: number = 5 * 60 * 1000) => {
  useEffect(() => {
    // Initial heartbeat
    const sendHeartbeat = async () => {
      try {
        // Simple, lightweight query to keep connection alive
        const { error } = await supabase.auth.getSession()
        if (error) {
          console.error('Supabase keep-alive error:', error)
        }
      } catch (error) {
        console.error('Supabase keep-alive exception:', error)
      }
    }

    // Send initial heartbeat
    sendHeartbeat()

    // Set up interval for periodic heartbeats
    const intervalId = setInterval(sendHeartbeat, intervalMs)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [intervalMs])
}
