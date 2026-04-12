'use client'

import { ReactNode, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import SplashScreen from '@/components/ui/SplashScreen'
import { useSplash } from '@/hooks/useSplash'

/* ============================================================
   SplashGate — client wrapper that mounts the SplashScreen on
   first visit and locks body scroll while it's playing.

   Lives at the root layout boundary. The root layout itself
   stays a server component (it exports `metadata`) — only this
   wrapper carries the client-side splash state. Children are
   always rendered (not unmounted) so the dashboard layout's
   PriceWaves canvas, store hydration, and any other heavy
   work happens behind the splash overlay during its 5-second
   playback. The splash sits at z-index 9999 so it covers
   everything cleanly without needing to defer mount.
   ============================================================ */

interface SplashGateProps {
  children: ReactNode
}

export function SplashGate({ children }: SplashGateProps) {
  const { showSplash, handleSplashComplete } = useSplash()

  /* Lock body scroll while the splash is up so users can't
     accidentally scroll past the overlay on touch devices. */
  useEffect(() => {
    if (!showSplash) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [showSplash])

  return (
    <>
      {children}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>
    </>
  )
}
