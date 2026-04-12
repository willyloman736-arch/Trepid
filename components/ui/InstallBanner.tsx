'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'

/* ============================================================
   InstallBanner — prompts mobile users to add Trepid to
   their home screen. Captures the beforeinstallprompt event on
   Android/Chrome. On iOS shows manual Share → Add instructions.

   - Only shows after 45s of engagement (not on first load)
   - Hides for 7 days after dismissal
   - Auto-hides if already in standalone mode (installed)
   - Uses the existing Icon component (no lucide-react dep)
   ============================================================ */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    /* Already installed → never show */
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone) return

    /* Dismissed recently → don't show for 7 days */
    const dismissed = localStorage.getItem('tg_install_dismissed')
    if (dismissed) {
      const days =
        (Date.now() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24)
      if (days < 7) return
    }

    /* iOS detection */
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      /* iOS doesn't support beforeinstallprompt; show manual instructions after 30s */
      const t = setTimeout(() => setShow(true), 30000)
      return () => clearTimeout(t)
    }

    /* Android/Chrome — capture the install prompt event */
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      /* Show banner after 45s of engagement */
      setTimeout(() => setShow(true), 45000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('tg_install_dismissed', new Date().toISOString())
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="glass-dark fixed z-[500] !rounded-[20px]"
        style={{
          bottom: 90,
          left: 16,
          right: 16,
          padding: '16px 20px',
        }}
      >
        {/* Dismiss X */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 grid place-items-center text-white/60 hover:bg-white/20 transition-colors"
          aria-label="Dismiss install banner"
        >
          <Icon name="close" className="w-3 h-3" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-3.5">
          {/* App icon */}
          <div className="w-[52px] h-[52px] rounded-[14px] bg-black border border-white/15 grid place-items-center shrink-0">
            <Icon
              name="shield-check"
              className="w-6 h-6 text-white"
              strokeWidth={2}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white">
              Add Trepid to Home Screen
            </p>
            <p className="text-[12px] text-white/45 leading-snug mt-0.5">
              {isIOS
                ? 'Tap Share then "Add to Home Screen"'
                : 'Install for instant access while trading'}
            </p>
          </div>

          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="btn-primary !px-4 !py-2 !text-[13px] !rounded-[10px] shrink-0"
            >
              Install
            </button>
          )}
        </div>

        {isIOS && (
          <div className="mt-3 px-3.5 py-2.5 rounded-[10px] bg-white/[0.06] flex items-center gap-2">
            <span className="text-[18px]">⬆</span>
            <span className="text-[12px] text-white/50">
              Tap the Share button in Safari, then &ldquo;Add to Home
              Screen&rdquo;
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
