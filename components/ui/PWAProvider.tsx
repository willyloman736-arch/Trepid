'use client'

import { useEffect } from 'react'

/* ============================================================
   PWAProvider — registers the service worker on first load.
   Mount once at the root layout level. Checks for updates
   every 30 minutes so returning users get the latest cache.
   ============================================================ */

export function PWAProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          // Check for SW updates every 30 minutes
          setInterval(() => reg.update(), 30 * 60 * 1000)
        })
        .catch((err) => {
          console.warn('[PWA] SW registration failed:', err)
        })
    }

    // Register after the page has fully loaded so it doesn't
    // compete with first-paint resources
    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
    }
  }, [])

  return null
}
