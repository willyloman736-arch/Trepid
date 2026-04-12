'use client'

import { useEffect, useRef } from 'react'

/* ============================================================
   NightSky — realistic star field background for the authenticated
   dashboard. Pure canvas + requestAnimationFrame, no libraries.

   Each star drifts extremely slowly (3-5 minutes to cross screen),
   twinkles on its own sine-phase clock, and wraps seamlessly at
   edges. The brightest ~2% get a radial glow bloom, and the very
   brightest get a 4-point cross sparkle at peak twinkle brightness.

   Star distribution matches the user's spec rolls:
     roll > 0.98 → 2% bright (size 2.2-3.0) with glow + sparkle
     roll > 0.90 → 8% medium (size 1.4-2.0) with glow
     roll > 0.60 → 30% small (size 0.8-1.3)
     else        → 60% tiny (size 0.3-0.7)

   DPR-aware for crisp stars on retina displays.
   ============================================================ */

interface Star {
  x: number
  y: number
  size: number
  driftX: number
  driftY: number
  twinklePhase: number
  twinkleSpeed: number
  color: string
  /* Per-frame transient: current blended opacity (base + twinkle) */
  opacity: number
}

/* Weighted palette — most stars pure white, a few cool/warm tints.
   Duplicated white entries bias selection toward pure white. */
const STAR_COLORS = [
  'rgba(255, 255, 255,',
  'rgba(255, 255, 255,',
  'rgba(255, 255, 255,',
  'rgba(220, 235, 255,',
  'rgba(255, 245, 220,',
  'rgba(200, 220, 255,',
  'rgba(255, 230, 200,',
] as const

export default function NightSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animId = 0
    let stars: Star[] = []
    let w = 0
    let h = 0

    const pickColor = () =>
      STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]

    const initStars = () => {
      stars = []
      /* Detect low-end devices and halve star count for them.
         navigator.hardwareConcurrency <= 4 and/or deviceMemory <= 4
         are strong signals of a budget phone. */
      const isLowEnd =
        (typeof navigator !== 'undefined' &&
          navigator.hardwareConcurrency != null &&
          navigator.hardwareConcurrency <= 4) ||
        ((navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8) <= 4
      const divisor = isLowEnd ? 12000 : 6000
      const count = Math.floor((w * h) / divisor)

      for (let i = 0; i < count; i++) {
        const roll = Math.random()
        let size: number
        if (roll > 0.98) {
          size = 2.2 + Math.random() * 0.8 // 2% — brightest with sparkle
        } else if (roll > 0.9) {
          size = 1.4 + Math.random() * 0.6 // 8% — medium with glow
        } else if (roll > 0.6) {
          size = 0.8 + Math.random() * 0.5 // 30% — small
        } else {
          size = 0.3 + Math.random() * 0.4 // 60% — tiny faint
        }

        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size,
          /* Extremely slow drift — a full screen width takes roughly
             3-5 minutes depending on velocity roll. Matches the feeling
             of actual earth rotation against the fixed stars. */
          driftX: (Math.random() - 0.5) * 0.025,
          driftY: (Math.random() - 0.5) * 0.015,
          /* Each star has its own random twinkle phase + speed so no
             two pulse in sync. */
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.008 + Math.random() * 0.025,
          color: pickColor(),
          opacity: 0, // populated on first tick
        })
      }
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      /* setTransform lets us draw in CSS pixels while the backing
         store is DPR-scaled for crispness on retina. */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initStars()
    }

    const drawStar = (s: Star) => {
      /* Tiny stars — single filled circle, no glow */
      if (s.size < 0.8) {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `${s.color}${s.opacity})`
        ctx.fill()
        return
      }

      /* Medium/large stars — outer glow bloom on size > 1.2 */
      if (s.size > 1.2) {
        const glowSize = s.size * 4
        const glowGrad = ctx.createRadialGradient(
          s.x,
          s.y,
          0,
          s.x,
          s.y,
          glowSize
        )
        glowGrad.addColorStop(0, `${s.color}${s.opacity * 0.3})`)
        glowGrad.addColorStop(0.4, `${s.color}${s.opacity * 0.08})`)
        glowGrad.addColorStop(1, `${s.color}0)`)
        ctx.beginPath()
        ctx.arc(s.x, s.y, glowSize, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()
      }

      /* Inner bright core — always for size > 0.8 */
      const coreGrad = ctx.createRadialGradient(
        s.x,
        s.y,
        0,
        s.x,
        s.y,
        s.size * 1.5
      )
      coreGrad.addColorStop(0, `${s.color}${s.opacity})`)
      coreGrad.addColorStop(0.5, `${s.color}${s.opacity * 0.6})`)
      coreGrad.addColorStop(1, `${s.color}0)`)
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()

      /* 4-point cross sparkle — only for the brightest stars at peak
         brightness. The sparkle fades in/out as the star twinkles. */
      if (s.size > 1.8 && s.opacity > 0.7) {
        const sparkLen = s.size * 6 * s.opacity
        const sparkOpacity = (s.opacity - 0.5) * 0.4

        ctx.strokeStyle = `${s.color}${sparkOpacity})`
        ctx.lineWidth = 0.5

        ctx.beginPath()
        ctx.moveTo(s.x - sparkLen, s.y)
        ctx.lineTo(s.x + sparkLen, s.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(s.x, s.y - sparkLen)
        ctx.lineTo(s.x, s.y + sparkLen)
        ctx.stroke()
      }
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]

        /* Twinkle — sine phase advance per star */
        s.twinklePhase += s.twinkleSpeed
        const twinkleFactor = Math.sin(s.twinklePhase)
        const twinkleAmount = s.size > 1.5 ? 0.35 : 0.15

        const baseOpacity =
          s.size > 1.8 ? 0.65 : s.size > 1.2 ? 0.35 : 0.2

        s.opacity = Math.max(
          0.02,
          Math.min(1.0, baseOpacity + twinkleFactor * twinkleAmount)
        )

        /* Drift — accumulate velocity, wrap at edges seamlessly */
        s.x += s.driftX
        s.y += s.driftY
        if (s.x > w + 10) s.x = -10
        else if (s.x < -10) s.x = w + 10
        if (s.y > h + 10) s.y = -10
        else if (s.y < -10) s.y = h + 10

        drawStar(s)
      }

      animId = requestAnimationFrame(tick)
    }

    resize()
    animId = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      stars = []
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
