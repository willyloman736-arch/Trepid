'use client'

import { useEffect, useRef } from 'react'

/* ============================================================
   SplashScreen — cinematic T + two figures animation.

   Sequence (~5.5s):
   0.0–0.8s  Stars twinkle on pure black
   0.8–1.6s  The letter T draws itself (stroke animation)
   1.6–2.0s  T glows briefly
   2.0–2.6s  Figure 1 walks from right onto the T crossbar
   2.6–3.2s  Figure 1 extends arms downward
   3.2–3.6s  Figure 2 appears below, arm raised
   3.6–4.0s  Figure 2 rises (pulled up with easeOutBack overshoot)
   4.0–4.3s  Connection flash at the handshake point
   4.3–5.2s  "Trepid" + subtitle text fades in
   5.2–5.5s  Everything fades to black → onComplete()

   Phase transitions use setTimeout (not RAF-gated) so the
   splash completes even if the tab is backgrounded.
   ============================================================ */

interface SplashScreenProps {
  onComplete: () => void
}

/* ── Easing functions ── */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const easeOutBack = (t: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/* ── Star type ── */
interface Star {
  x: number
  y: number
  size: number
  phase: number
  speed: number
  baseOpacity: number
}

function initStars(w: number, h: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < 80; i++) {
    const roll = Math.random()
    const size = roll > 0.95 ? 1.8 + Math.random() * 0.6 : roll > 0.7 ? 0.8 + Math.random() * 0.5 : 0.3 + Math.random() * 0.4
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.025,
      baseOpacity: size > 1.5 ? 0.6 : size > 0.7 ? 0.35 : 0.18,
    })
  }
  return stars
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], elapsed: number) {
  for (const s of stars) {
    const twinkle = Math.sin(elapsed * 3 + s.phase) * (s.size > 1.2 ? 0.3 : 0.12)
    const opacity = Math.max(0.02, Math.min(1, s.baseOpacity + twinkle))
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${opacity})`
    ctx.fill()
    if (s.size > 1.5) {
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3)
      g.addColorStop(0, `rgba(255,255,255,${opacity * 0.25})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
    }
  }
}

/* ── T dimensions (scaled to viewport) ── */
function getT(w: number, h: number) {
  const scale = Math.min(w, h) / 600
  const cx = w / 2
  const cy = h * 0.42
  const crossW = 120 * scale
  const crossH = 16 * scale
  const stemW = 16 * scale
  const stemH = 110 * scale
  const crossY = cy - stemH / 2
  return { cx, cy, crossW, crossH, stemW, stemH, crossY, scale }
}

/* ── Draw animated T ── */
function drawT(ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) {
  const T = getT(w, h)
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Crossbar draws first (progress 0→0.5)
  const crossProgress = Math.min(1, progress / 0.5)
  if (crossProgress > 0) {
    const halfW = T.crossW / 2 * easeOutCubic(crossProgress)
    ctx.beginPath()
    ctx.moveTo(T.cx - halfW, T.crossY)
    ctx.lineTo(T.cx + halfW, T.crossY)
    ctx.stroke()
    // Crossbar thickness
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillRect(T.cx - halfW, T.crossY - T.crossH / 2, halfW * 2, T.crossH)
  }

  // Stem draws second (progress 0.5→1.0)
  if (progress > 0.5) {
    const stemProgress = easeOutCubic((progress - 0.5) / 0.5)
    const stemLen = T.stemH * stemProgress
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillRect(T.cx - T.stemW / 2, T.crossY + T.crossH / 2, T.stemW, stemLen)
  }

  ctx.restore()
}

/* ── Draw T glow ── */
function drawTGlow(ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) {
  const T = getT(w, h)
  const alpha = progress < 0.5 ? progress * 2 * 0.15 : (1 - progress) * 2 * 0.15
  const g = ctx.createRadialGradient(T.cx, T.cy, 0, T.cx, T.cy, 120 * T.scale)
  g.addColorStop(0, `rgba(255,255,255,${alpha})`)
  g.addColorStop(0.5, `rgba(200,220,255,${alpha * 0.4})`)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(T.cx, T.cy, 120 * T.scale, 0, Math.PI * 2)
  ctx.fill()
}

/* ── Human silhouette ── */
function drawHuman(
  ctx: CanvasRenderingContext2D,
  x: number,
  feetY: number,
  scale: number,
  armAngle: number,
  opacity: number,
  bobY = 0
) {
  const s = scale
  const y = feetY + bobY
  ctx.save()
  ctx.fillStyle = `rgba(255,255,255,${opacity})`
  ctx.shadowBlur = 6
  ctx.shadowColor = `rgba(255,255,255,${opacity * 0.2})`

  // Head
  ctx.beginPath()
  ctx.arc(x, y - s * 36, s * 5, 0, Math.PI * 2)
  ctx.fill()

  // Torso
  ctx.fillRect(x - s * 3.5, y - s * 30, s * 7, s * 16)

  // Left arm
  ctx.save()
  ctx.translate(x - s * 3.5, y - s * 28)
  ctx.rotate(armAngle * Math.PI * 0.55)
  ctx.fillRect(-s * 1.5, 0, s * 3, s * 14)
  ctx.restore()

  // Right arm
  ctx.save()
  ctx.translate(x + s * 3.5, y - s * 28)
  ctx.rotate(-armAngle * Math.PI * 0.55)
  ctx.fillRect(-s * 1.5, 0, s * 3, s * 14)
  ctx.restore()

  // Left leg
  ctx.fillRect(x - s * 3.5, y - s * 14, s * 3, s * 14)

  // Right leg
  ctx.fillRect(x + s * 0.5, y - s * 14, s * 3, s * 14)

  ctx.shadowBlur = 0
  ctx.restore()
}

/* ── Upward-reaching figure (arms up) ── */
function drawHumanReaching(
  ctx: CanvasRenderingContext2D,
  x: number,
  feetY: number,
  scale: number,
  opacity: number
) {
  const s = scale
  const y = feetY
  ctx.save()
  ctx.fillStyle = `rgba(255,255,255,${opacity})`
  ctx.shadowBlur = 6
  ctx.shadowColor = `rgba(255,255,255,${opacity * 0.2})`

  // Head
  ctx.beginPath()
  ctx.arc(x, y - s * 36, s * 5, 0, Math.PI * 2)
  ctx.fill()

  // Torso
  ctx.fillRect(x - s * 3.5, y - s * 30, s * 7, s * 16)

  // Arms reaching UP
  ctx.save()
  ctx.translate(x - s * 3, y - s * 28)
  ctx.rotate(-Math.PI * 0.4) // reaching upward-left
  ctx.fillRect(-s * 1.5, -s * 14, s * 3, s * 14)
  ctx.restore()

  ctx.save()
  ctx.translate(x + s * 3, y - s * 28)
  ctx.rotate(Math.PI * 0.4) // reaching upward-right
  ctx.fillRect(-s * 1.5, -s * 14, s * 3, s * 14)
  ctx.restore()

  // Legs
  ctx.fillRect(x - s * 3.5, y - s * 14, s * 3, s * 14)
  ctx.fillRect(x + s * 0.5, y - s * 14, s * 3, s * 14)

  ctx.shadowBlur = 0
  ctx.restore()
}

/* ── Connection flash ── */
function drawFlash(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) {
  const radius = 25 * progress
  const alpha = 1 - progress
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
  g.addColorStop(0, `rgba(255,255,255,${alpha})`)
  g.addColorStop(0.4, `rgba(200,220,255,${alpha * 0.5})`)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

/* ── Text reveal ── */
function drawText(ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) {
  const T = getT(w, h)
  const isMobile = w < 768
  const titleSize = isMobile ? 48 : 64
  const textY = T.crossY + T.stemH + 60 * T.scale

  // "Trepid"
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = `800 ${titleSize}px Inter, -apple-system, sans-serif`
  ctx.fillStyle = `rgba(255,255,255,${easeOutCubic(progress) * 0.95})`
  ctx.shadowBlur = 20
  ctx.shadowColor = `rgba(255,255,255,${progress * 0.3})`
  ctx.fillText('Trepid', w / 2, textY + (1 - easeOutCubic(progress)) * 12)
  ctx.shadowBlur = 0

  // Subtitle (delayed slightly)
  const subProgress = Math.max(0, (progress - 0.3) / 0.7)
  if (subProgress > 0) {
    ctx.font = `400 ${isMobile ? 11 : 13}px Inter, -apple-system, sans-serif`
    ctx.fillStyle = `rgba(255,255,255,${easeOutCubic(subProgress) * 0.4})`
    ctx.fillText(
      'JOIN THE 1% OF PROFITABLE TRADERS',
      w / 2,
      textY + titleSize + 14
    )
  }
  ctx.restore()
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

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
    const stars = initStars(w, h)
    const startTime = performance.now()

    const T = getT(w, h)
    const isMobile = w < 768
    const figScale = (isMobile ? 0.75 : 0.9) * T.scale

    /* Walk start/end positions */
    const walkStartX = w * 0.7
    const walkEndX = T.cx
    const walkY = T.crossY - T.crossH / 2 - 2

    /* Figure 2 positions */
    const fig2StartY = T.crossY + T.stemH + 50 * T.scale
    const fig2EndY = T.crossY + 8 * T.scale
    const connectionY = T.crossY + 15 * T.scale

    const tick = (now: number) => {
      if (cancelled) return
      const elapsed = (now - startTime) / 1000

      ctx.clearRect(0, 0, w, h)

      // Always draw stars
      drawStars(ctx, stars, elapsed)

      if (elapsed < 0.8) {
        // Stars only
      } else if (elapsed < 1.6) {
        const p = (elapsed - 0.8) / 0.8
        drawT(ctx, w, h, easeOutCubic(p))
      } else if (elapsed < 2.0) {
        drawT(ctx, w, h, 1)
        drawTGlow(ctx, w, h, (elapsed - 1.6) / 0.4)
      } else if (elapsed < 2.6) {
        drawT(ctx, w, h, 1)
        drawTGlow(ctx, w, h, 0.3)
        const walkP = easeOutCubic((elapsed - 2.0) / 0.6)
        const fx = walkStartX + (walkEndX - walkStartX) * walkP
        const bob = Math.sin(walkP * Math.PI * 6) * 3
        drawHuman(ctx, fx, walkY, figScale, 0, 0.95, bob)
      } else if (elapsed < 3.2) {
        drawT(ctx, w, h, 1)
        drawTGlow(ctx, w, h, 0.3)
        const armP = easeInOutCubic((elapsed - 2.6) / 0.6)
        drawHuman(ctx, walkEndX, walkY, figScale, armP, 0.95)
      } else if (elapsed < 3.6) {
        drawT(ctx, w, h, 1)
        drawTGlow(ctx, w, h, 0.3)
        drawHuman(ctx, walkEndX, walkY, figScale, 1, 0.95)
        const appearP = easeOutCubic((elapsed - 3.2) / 0.4)
        drawHumanReaching(ctx, T.cx, fig2StartY, figScale * 0.85, appearP * 0.95)
      } else if (elapsed < 4.0) {
        drawT(ctx, w, h, 1)
        drawTGlow(ctx, w, h, 0.3)
        drawHuman(ctx, walkEndX, walkY, figScale, 1, 0.95)
        const riseP = Math.min(1, easeOutBack((elapsed - 3.6) / 0.4))
        const fy = fig2StartY + (fig2EndY - fig2StartY) * riseP
        drawHumanReaching(ctx, T.cx, fy, figScale * 0.85, 0.95)
      } else if (elapsed < 4.3) {
        drawT(ctx, w, h, 1)
        drawTGlow(ctx, w, h, 0.3)
        drawHuman(ctx, walkEndX, walkY, figScale, 0.3, 0.95)
        drawHumanReaching(ctx, T.cx, fig2EndY, figScale * 0.85, 0.95)
        drawFlash(ctx, T.cx, connectionY, (elapsed - 4.0) / 0.3)
      } else if (elapsed < 5.2) {
        drawT(ctx, w, h, 1)
        drawTGlow(ctx, w, h, 0.3)
        // Both figures together at top
        drawHuman(ctx, walkEndX - 10 * T.scale, walkY, figScale, 0, 0.95)
        drawHuman(ctx, walkEndX + 10 * T.scale, walkY, figScale * 0.85, 0, 0.95)
        const textP = Math.min(1, (elapsed - 4.3) / 0.5)
        drawText(ctx, w, h, textP)
      } else if (elapsed < 5.5) {
        const fade = (elapsed - 5.2) / 0.3
        ctx.globalAlpha = 1 - fade
        drawT(ctx, w, h, 1)
        drawHuman(ctx, walkEndX - 10 * T.scale, walkY, figScale, 0, 0.95)
        drawHuman(ctx, walkEndX + 10 * T.scale, walkY, figScale * 0.85, 0, 0.95)
        drawText(ctx, w, h, 1)
        ctx.globalAlpha = 1
      } else {
        // Complete
        if (!cancelled) onComplete()
        return
      }

      animId = requestAnimationFrame(tick)
    }

    // Start RAF
    animId = requestAnimationFrame(tick)

    // Safety timeout: ensure onComplete fires even if RAF is paused
    timeouts.push(
      setTimeout(() => {
        if (!cancelled) onComplete()
      }, 6000)
    )

    return () => {
      cancelled = true
      cancelAnimationFrame(animId)
      timeouts.forEach((t) => clearTimeout(t))
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
