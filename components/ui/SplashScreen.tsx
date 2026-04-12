'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ============================================================
   SplashScreen — video-based splash.
   Plays public/splash-video.mp4 fullscreen on first session visit.
   Fades to black when the video ends, then calls onComplete().
   Skip button appears after 2s. Mobile skips video entirely.
   Falls back gracefully if autoplay is blocked or video fails.
   ============================================================ */

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [phase, setPhase] = useState<'loading' | 'playing' | 'fading' | 'done'>(
    'loading'
  )
  const completedRef = useRef(false)

  /* Stable complete handler — only fires once */
  const complete = () => {
    if (completedRef.current) return
    completedRef.current = true
    onComplete()
  }

  useEffect(() => {
    /* Mobile detection — skip video entirely on phones/tablets */
    const isMobile =
      typeof navigator !== 'undefined' &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      /* Show the black screen for 1.5s with just the logo, then complete */
      const t = setTimeout(complete, 1500)
      setPhase('playing') // shows the poster/fallback
      return () => clearTimeout(t)
    }

    const video = videoRef.current
    if (!video) return

    const timeouts: ReturnType<typeof setTimeout>[] = []

    const handleCanPlay = () => {
      setPhase('playing')
      video.play().catch(() => {
        /* Autoplay blocked — skip splash */
        complete()
      })
    }

    const handleEnded = () => {
      setPhase('fading')
      timeouts.push(setTimeout(complete, 800))
    }

    const handleError = () => {
      complete()
    }

    /* Timeout fallback — if video takes >3s to load, skip */
    timeouts.push(
      setTimeout(() => {
        if (!completedRef.current && phase === 'loading') {
          complete()
        }
      }, 3000)
    )

    video.addEventListener('canplaythrough', handleCanPlay)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    return () => {
      timeouts.forEach((t) => clearTimeout(t))
      video.removeEventListener('canplaythrough', handleCanPlay)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'done') return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'fading' ? 0 : 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000000',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {/* Loading state — minimal dot pulse while video loads */}
        {phase === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.5)',
              }}
            />
          </motion.div>
        )}

        {/* The video — covers entire viewport */}
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: phase === 'playing' || phase === 'fading' ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          muted
          playsInline
          preload="auto"
        >
          <source src="/splash-video.mp4" type="video/mp4" />
        </video>

        {/* Skip button — appears after 2 seconds */}
        <SkipButton onSkip={complete} phase={phase} />
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Skip button ── */
function SkipButton({ onSkip, phase }: { onSkip: () => void; phase: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (phase !== 'playing') return
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [phase])

  if (!visible) return null

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onClick={onSkip}
      style={{
        position: 'absolute',
        bottom: 32,
        right: 32,
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: '8px 18px',
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontWeight: 500,
        letterSpacing: '0.06em',
        cursor: 'pointer',
        zIndex: 10,
        transition: 'color 0.2s ease, border-color 0.2s ease',
      }}
    >
      SKIP
    </motion.button>
  )
}
