'use client'

import { useEffect, useRef } from 'react'

/* ============================================================
   SplashScreen — pure canvas, zero video files.
   Draws the Trepid "T" with glow + twinkling stars.
   Total duration ~4.5s. Instant start, no buffering.
   ============================================================ */

interface SplashScreenProps {
  onComplete: () => void
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

interface Star {
  x: number
  y: number
  size: number
  phase: number
  speed: number
  base: number
}

function initStars(w: number, h: number): Star[] {
  const stars: Star[] = []
  const count = Math.floor((w * h) / 5000)
  for (let i = 0; i < count; i++) {
    const r = Math.random()
    const size = r > 0.96 ? 2.2 + Math.random() * 0.8 : r > 0.8 ? 1.2 + Math.random() * 0.6 : 0.4 + Math.random() * 0.5
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.02,
      base: size > 1.5 ? 0.7 : size > 1 ? 0.4 : 0.2,
    })
  }
  return stars
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], t: number) {
  for (const s of stars) {
    const twinkle = Math.sin(t * 3 + s.phase) * (s.size > 1.2 ? 0.25 : 0.1)
    const op = Math.max(0.05, Math.min(1, s.base + twinkle))
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${op})`
    ctx.fill()
    if (s.size > 1.5) {
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4)
      g.addColorStop(0, `rgba(255,255,255,${op * 0.3})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
    }
  }
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cancelled = false
    let animId = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const stars = initStars(w, h)
    const startTime = performance.now()

    /* T dimensions — responsive */
    const scale = Math.min(w, h) / 600
    const cx = w / 2
    const cy = h * 0.42
    const crossW = 130 * scale
    const crossH = 22 * scale
    const stemW = 22 * scale
    const stemH = 140 * scale
    const crossY = cy - stemH * 0.4

    /* Draw the T letter */
    const drawT = (progress: number, glowAlpha: number) => {
      ctx.save()

      /* Glow behind T */
      if (glowAlpha > 0) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160 * scale)
        g.addColorStop(0, `rgba(255,255,255,${glowAlpha * 0.2})`)
        g.addColorStop(0.5, `rgba(200,220,255,${glowAlpha * 0.08})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, 160 * scale, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = `rgba(255,255,255,${Math.min(progress * 1.2, 0.95)})`
      ctx.shadowBlur = 16 * glowAlpha
      ctx.shadowColor = `rgba(255,255,255,${glowAlpha * 0.5})`

      /* Crossbar — draws first (progress 0→0.5) */
      const crossP = Math.min(1, progress / 0.5)
      if (crossP > 0) {
        const halfW = crossW / 2 * easeOut(crossP)
        ctx.beginPath()
        ctx.roundRect(cx - halfW, crossY - crossH / 2, halfW * 2, crossH, 4 * scale)
        ctx.fill()
      }

      /* Stem — draws second (progress 0.5→1.0) */
      if (progress > 0.5) {
        const stemP = easeOut((progress - 0.5) / 0.5)
        const stemLen = stemH * stemP
        ctx.beginPath()
        ctx.roundRect(cx - stemW / 2, crossY + crossH / 2, stemW, stemLen, 4 * scale)
        ctx.fill()
      }

      ctx.shadowBlur = 0
      ctx.restore()
    }

    /* Draw text */
    const drawText = (alpha: number) => {
      if (alpha <= 0) return
      const isMobile = w < 768
      const titleSize = isMobile ? 42 : 56

      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      /* "Trepid" */
      ctx.font = `800 ${titleSize}px Inter, -apple-system, sans-serif`
      ctx.fillStyle = `rgba(255,255,255,${easeOut(alpha) * 0.95})`
      ctx.shadowBlur = 24
      ctx.shadowColor = `rgba(255,255,255,${alpha * 0.3})`
      const textY = crossY + stemH + 40 * scale
      ctx.fillText('Trepid', cx, textY + (1 - easeOut(alpha)) * 10)

      /* Subtitle */
      ctx.shadowBlur = 0
      const subAlpha = Math.max(0, (alpha - 0.3) / 0.7)
      if (subAlpha > 0) {
        ctx.font = `400 ${isMobile ? 11 : 13}px Inter, -apple-system, sans-serif`
        ctx.fillStyle = `rgba(255,255,255,${easeOut(subAlpha) * 0.4})`
        ctx.letterSpacing = '2px'
        ctx.fillText('DISCIPLINE ENGINE', cx, textY + titleSize + 16)
      }

      ctx.restore()
    }

    /* Animation timeline:
       0.0–0.4s  Stars fade in
       0.4–1.4s  T draws itself
       1.4–1.8s  T glows
       1.8–2.8s  "Trepid" + subtitle fades in
       2.8–3.8s  Hold
       3.8–4.5s  Fade to black → complete */

    const tick = (now: number) => {
      if (cancelled) return
      const elapsed = (now - startTime) / 1000

      ctx.clearRect(0, 0, w, h)

      /* Stars — always visible, fade in during first 0.4s */
      const starAlpha = Math.min(1, elapsed / 0.4)
      ctx.globalAlpha = starAlpha
      drawStars(ctx, stars, elapsed)
      ctx.globalAlpha = 1

      if (elapsed >= 0.4 && elapsed < 1.4) {
        /* T draws */
        const p = easeInOut((elapsed - 0.4) / 1.0)
        drawT(p, p * 0.5)
      } else if (elapsed >= 1.4 && elapsed < 3.8) {
        /* T complete + glow + text */
        const glowP = elapsed < 1.8 ? (elapsed - 1.4) / 0.4 : 1
        drawT(1, 0.3 + glowP * 0.4)

        if (elapsed >= 1.8) {
          const textP = Math.min(1, (elapsed - 1.8) / 0.6)
          drawText(textP)
        }
      } else if (elapsed >= 3.8 && elapsed < 4.5) {
        /* Fade out */
        const fade = 1 - (elapsed - 3.8) / 0.7
        ctx.globalAlpha = fade
        drawT(1, 0.5)
        drawText(1)
        ctx.globalAlpha = 1
      } else if (elapsed >= 4.5) {
        if (!cancelled) onComplete()
        return
      }

      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    /* Safety: complete after 6s no matter what */
    timeouts.push(setTimeout(() => { if (!cancelled) onComplete() }, 6000))

    return () => {
      cancelled = true
      cancelAnimationFrame(animId)
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        zIndex: 9999,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
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
    </div>
  )
}
