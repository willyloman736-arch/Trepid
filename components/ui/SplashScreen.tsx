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

    let started = false
    const handleCanPlay = () => {
      /* Only start on canplaythrough — guarantees the ENTIRE video
         is buffered before playback begins. No stutter, no cutoff. */
    }

    const handleFullyBuffered = () => {
      if (started) return
      started = true
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

    /* Timeout fallback — if video takes >8s to START loading, skip.
       Increased from 3s because the video is 4MB / 9s and needs time
       to buffer on slower connections. Once playing, let it run to
       completion (the 'ended' event handles that). */
    timeouts.push(
      setTimeout(() => {
        if (!completedRef.current && !video.currentTime) {
          /* Video hasn't started playing at all after 8s — skip */
          complete()
        }
      }, 8000)
    )

    /* Hard safety cap — if video is STILL playing after 15s, complete.
       Covers edge cases like infinite-length streams or stuck buffers. */
    timeouts.push(
      setTimeout(() => {
        if (!completedRef.current) {
          setPhase('fading')
          timeouts.push(setTimeout(complete, 800))
        }
      }, 15000)
    )

    /* Only listen to canplaythrough — waits until the browser
       estimates it can play the ENTIRE video without buffering.
       This eliminates all stutter and partial playback. */
    video.addEventListener('canplaythrough', handleFullyBuffered)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    /* Also manually check buffered range — some browsers fire
       canplaythrough too early. Double-check every 500ms. */
    const bufferCheck = setInterval(() => {
      if (started || completedRef.current) {
        clearInterval(bufferCheck)
        return
      }
      if (video.buffered.length > 0 && video.duration > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        if (bufferedEnd >= video.duration - 0.5) {
          /* Fully buffered — safe to play without stutter */
          clearInterval(bufferCheck)
          handleFullyBuffered()
        }
      }
    }, 500)

    return () => {
      clearInterval(bufferCheck)
      timeouts.forEach((t) => clearTimeout(t))
      video.removeEventListener('canplaythrough', handleFullyBuffered)
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
        {/* Loading state — pulsing T logo while video fully buffers */}
        {phase === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
            }}
          >
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Inter, -apple-system, sans-serif',
                letterSpacing: '-0.04em',
              }}
            >
              T
            </motion.div>
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
