'use client'

import { useCallback, useEffect, useState } from 'react'

/* ============================================================
   useSplash — gates the splash screen on a sessionStorage flag.

   Behavior:
     - First visit in a browser session: showSplash=true.
     - Subsequent visits in the same session: shows nothing.
     - New session (closed/reopened browser): plays again.

   The handler is wrapped in useCallback so its identity is
   stable. SplashScreen depends on it inside a useEffect; an
   unstable identity would restart the canvas animation on
   every render.
   ============================================================ */

const STORAGE_KEY = 'tg_splash_seen'

export function useSplash() {
  /* Initial state intentionally false on both server and client.
     The actual decision happens in useEffect after hydration so
     SSR output stays stable. */
  const [showSplash, setShowSplash] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const seen = sessionStorage.getItem(STORAGE_KEY)
      if (!seen) {
        setShowSplash(true)
      } else {
        setSplashDone(true)
      }
    } catch {
      /* sessionStorage may be unavailable (private mode, etc.) — fail open */
      setSplashDone(true)
    }
  }, [])

  const handleSplashComplete = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      /* ignore */
    }
    setShowSplash(false)
    setSplashDone(true)
  }, [])

  return { showSplash, splashDone, handleSplashComplete }
}
