'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ============================================================
   SplashScreen — cinematic light-beam intro inspired by Grok.
   Three phases: beam → text → exit. Total runtime ~5 seconds.

   The beam grows from a single bright point, expands into a
   vertical shaft of light, then a horizontal lens flare with
   volumetric rays. The "Trepid" wordmark fades in through
   the light. Then everything fades to black and onComplete is
   invoked, which unmounts this component and reveals the app.

   Cleanup is hardened: a `cancelled` flag and a timeouts array
   ensure that on Strict Mode double-mount or premature unmount
   no setState calls fire after the component is gone.
   ============================================================ */

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'beam' | 'text' | 'exit'>('beam')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /* DPR-aware sizing for crisp beam edges on retina displays */
    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let cancelled = false
    let animId = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []

    /* TIMING — phase progression is driven by real-time setTimeout
       (which still fires in hidden tabs, unlike requestAnimationFrame).
       The RAF loop only handles visual drawing; if RAF is paused,
       the splash still completes on schedule. */
    const initialDelayMs = 400
    const beamDurationMs = 2333 // ~140 frames at 60fps
    const textHoldMs = 2200
    const exitMs = 900

    const startTime = performance.now() + initialDelayMs

    /* easeInOutCubic — Apple-spec ease */
    const ease = (p: number) =>
      p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2

    const drawBeam = () => {
      if (cancelled) return

      ctx.clearRect(0, 0, w, h)

      const cx = w * 0.5
      const cy = h * 0.42

      /* Time-driven progress, not frame-driven, so any skipped
         frames don't desync the animation from the phase clock. */
      const elapsed = performance.now() - startTime
      const progress = Math.max(0, Math.min(elapsed / beamDurationMs, 1))
      const eased = ease(progress)
      /* Decorative frame counter for the volumetric ray phase shift */
      const frame = Math.floor(elapsed / 16.667)

      /* ── CORE BEAM — central vertical shaft of light ── */
      const beamHeight = h * 1.4
      const beamWidth = 2 + eased * 180

      const beamGrad = ctx.createRadialGradient(
        cx,
        cy - beamHeight * 0.1,
        0,
        cx,
        cy,
        beamWidth * 3
      )
      beamGrad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * eased})`)
      beamGrad.addColorStop(0.08, `rgba(200, 220, 255, ${0.7 * eased})`)
      beamGrad.addColorStop(0.2, `rgba(120, 160, 255, ${0.35 * eased})`)
      beamGrad.addColorStop(0.5, `rgba(60, 100, 220, ${0.15 * eased})`)
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.save()
      ctx.fillStyle = beamGrad
      ctx.beginPath()
      ctx.ellipse(
        cx,
        cy,
        beamWidth * (0.3 + eased * 2),
        beamHeight * (0.3 + eased * 0.8),
        0,
        0,
        Math.PI * 2
      )
      ctx.fill()
      ctx.restore()

      /* ── LENS FLARE — horizontal light spread at the source ── */
      if (eased > 0.3) {
        const flareProgress = (eased - 0.3) / 0.7
        const flareWidth = w * 1.2 * flareProgress

        const flareGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, flareWidth)
        flareGrad.addColorStop(0, `rgba(180, 200, 255, ${0.6 * flareProgress})`)
        flareGrad.addColorStop(0.1, `rgba(100, 140, 255, ${0.3 * flareProgress})`)
        flareGrad.addColorStop(0.4, `rgba(60, 100, 200, ${0.1 * flareProgress})`)
        flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.save()
        ctx.fillStyle = flareGrad
        ctx.beginPath()
        ctx.ellipse(cx, cy, flareWidth, flareWidth * 0.18, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      /* ── BRIGHT CENTER POINT — white-hot origin of the beam ── */
      if (eased > 0.1) {
        const pointGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 * eased)
        pointGrad.addColorStop(0, `rgba(255, 255, 255, ${eased})`)
        pointGrad.addColorStop(0.3, `rgba(220, 235, 255, ${0.6 * eased})`)
        pointGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = pointGrad
        ctx.beginPath()
        ctx.arc(cx, cy, 80 * eased, 0, Math.PI * 2)
        ctx.fill()
      }

      /* ── VOLUMETRIC LIGHT RAYS — diagonal scatter from origin ── */
      if (eased > 0.5) {
        const rayProgress = (eased - 0.5) / 0.5
        const rayCount = 8
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + frame * 0.002
          const rayLen = (60 + Math.sin(angle * 3) * 30) * rayProgress * 3
          const rayOpacity =
            0.03 * rayProgress * (0.5 + Math.sin(frame * 0.05 + i) * 0.5)

          ctx.save()
          ctx.strokeStyle = `rgba(180, 210, 255, ${rayOpacity})`
          ctx.lineWidth = 1 + Math.sin(i) * 0.5
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen)
          ctx.stroke()
          ctx.restore()
        }
      }

      /* Continue the RAF loop until the beam reaches full progress
         plus a small tail (so the final frame is drawn even if a
         frame is dropped). After that, no more drawing is needed. */
      if (progress < 1.05) {
        animId = requestAnimationFrame(drawBeam)
      }
    }

    /* Start drawing after the initial black-out delay */
    timeouts.push(
      setTimeout(() => {
        if (cancelled) return
        animId = requestAnimationFrame(drawBeam)
      }, initialDelayMs)
    )

    /* PHASE TRANSITIONS — driven by setTimeout, independent of RAF.
       This guarantees the splash completes even when the tab is in
       a hidden/background state and RAF is paused by the browser. */
    timeouts.push(
      setTimeout(() => {
        if (cancelled) return
        setPhase('text')
      }, initialDelayMs + beamDurationMs)
    )

    timeouts.push(
      setTimeout(
        () => {
          if (cancelled) return
          setPhase('exit')
        },
        initialDelayMs + beamDurationMs + textHoldMs
      )
    )

    timeouts.push(
      setTimeout(
        () => {
          if (cancelled) return
          onComplete()
        },
        initialDelayMs + beamDurationMs + textHoldMs + exitMs
      )
    )

    return () => {
      cancelled = true
      cancelAnimationFrame(animId)
      timeouts.forEach((t) => clearTimeout(t))
    }
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
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
      {/* Light beam canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Brand wordmark — fades in through the light during the text phase */}
      <AnimatePresence>
        {phase !== 'beam' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.3em' }}
              animate={{ opacity: 1, letterSpacing: '-0.03em' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(52px, 10vw, 96px)',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.95)',
                fontFamily: 'Inter, -apple-system, sans-serif',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                margin: 0,
                textShadow: `
                  0 0 60px rgba(120, 160, 255, 0.8),
                  0 0 120px rgba(80, 120, 255, 0.4),
                  0 0 200px rgba(60, 100, 220, 0.2)
                `,
              }}
            >
              Trepid
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(13px, 2vw, 16px)',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'Inter, -apple-system, sans-serif',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              Discipline Engine
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-left tag — Grok-style "Discipline Engine" */}
      <AnimatePresence>
        {phase === 'text' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.35, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{
              position: 'absolute',
              bottom: 32,
              left: 32,
              zIndex: 2,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'Inter, -apple-system, sans-serif',
                margin: 0,
                letterSpacing: '0.04em',
              }}
            >
              Discipline Engine
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
