'use client'

import { useEffect, useState } from 'react'
import { syncPendingTrades } from '@/lib/offline-queue'

/* ============================================================
   useOnlineStatus — tracks navigator.onLine and auto-syncs
   any queued trades when the connection comes back. Exposes
   a reactive { isOnline } value for UI indicators.
   ============================================================ */

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      try {
        await syncPendingTrades()
      } catch {
        // swallow — sync failures are retried on next reconnect
      }
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}
