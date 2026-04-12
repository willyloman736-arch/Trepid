'use client'

import { useEffect, useRef } from 'react'

/* ============================================================
   PriceWaves — canvas-based forex price line background.

   7 faint sine-wave lines drift across the screen at different
   speeds, each combining multiple noise frequencies to look like
   real price charts rather than smooth math curves. Ghost
   candlesticks appear and fade along the waves for depth.

   Enforcement level shifts the palette:
     0-2 → cool blues, teals, whites, subtle green (clean)
     3-4 → amber / orange / yellow (warning)
     5-6 → reds (danger)
   Color transitions lerp smoothly per frame — not a hard swap.

   Performance:
     - 60fps target
     - clearRect every frame
     - step = 4px between wave points (min for smoothness)
     - DPR-aware canvas sizing
     - Cleanup: cancelAnimationFrame + resize listener removal
   ============================================================ */

interface PriceWavesProps {
  /** 0-6 enforcement ladder level. Shifts wave palette. */
  enforcementLevel?: number
}

interface WaveLine {
  speed: number
  amplitude: number
  frequency: number
  phase: number
  opacity: number
  width: number
  yBase: number
  noiseOffset: number
  /** Stable per-wave palette index so the color slot doesn't flicker. */
  colorIdx: number
}

/* --- Palettes keyed by level band --- */
const PALETTE_CLEAN = [
  [0, 122, 255], // Apple blue
  [90, 200, 250], // Apple teal
  [255, 255, 255], // white
  [48, 209, 88], // Apple green
  [0, 122, 255],
  [94, 92, 230], // Apple indigo
  [90, 200, 250],
] as const

const PALETTE_WARNING = [
  [255, 159, 10], // orange
  [255, 214, 10], // yellow
  [255, 159, 10],
  [48, 209, 88], // still a little green
  [255, 159, 10],
  [200, 120, 10], // dim amber
  [255, 180, 50],
] as const

const PALETTE_DANGER = [
  [255, 59, 48], // red
  [255, 159, 10], // orange accent
  [255, 59, 48],
  [200, 40, 40],
  [255, 100, 80],
  [180, 30, 30],
  [255, 59, 48],
] as const

function targetPalette(level: number) {
  if (level >= 5) return PALETTE_DANGER
  if (level >= 3) return PALETTE_WARNING
  return PALETTE_CLEAN
}

type RGB = [number, number, number]

function lerpRGB(a: RGB, b: readonly [number, number, number], t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

export function PriceWaves({ enforcementLevel = 0 }: PriceWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const levelRef = useRef(enforcementLevel)

  /* Keep latest level in ref so the RAF loop sees updates without restarting */
  useEffect(() => {
    levelRef.current = enforcementLevel
  }, [enforcementLevel])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animId = 0
    let waves: WaveLine[] = []
    let time = 0
    let candleTimer = 0
    const candleInterval = 180 // frames between ghost-candle scatters

    /* Width / height tracked in CSS pixels (ctx is transformed by DPR). */
    let width = 0
    let height = 0

    /* Per-wave current color (lerped toward the target palette each frame) */
    const currentColors: RGB[] = []

    /* --- Smooth organic noise from sin combinations --- */
    const smoothNoise = (x: number, offset: number) => {
      return (
        Math.sin(x * 0.8 + offset) * 0.5 +
        Math.sin(x * 1.4 + offset * 1.3) * 0.3 +
        Math.sin(x * 2.1 + offset * 0.7) * 0.15 +
        Math.sin(x * 0.3 + offset * 2.1) * 0.05
      )
    }

    const initWaves = () => {
      waves = []
      currentColors.length = 0
      const palette = targetPalette(levelRef.current)

      /* 7 wave lines across the viewport */
      for (let i = 0; i < 7; i++) {
        const yBase = (height / 8) * (i + 1)
        waves.push({
          speed: 0.0003 + Math.random() * 0.0004,
          amplitude: height * (0.03 + Math.random() * 0.06),
          frequency: 0.003 + Math.random() * 0.004,
          phase: Math.random() * Math.PI * 2,
          opacity: 0.06 + Math.random() * 0.1,
          width: 0.5 + Math.random() * 0.8,
          yBase,
          noiseOffset: Math.random() * 1000,
          colorIdx: i,
        })
        currentColors.push([...palette[i % palette.length]] as RGB)
      }
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initWaves()
    }

    /* --- One wave line render pass --- */
    const drawWave = (wave: WaveLine, curColor: RGB, t: number) => {
      ctx.beginPath()
      ctx.lineWidth = wave.width
      ctx.strokeStyle = `rgba(${curColor[0] | 0}, ${curColor[1] | 0}, ${curColor[2] | 0}, ${wave.opacity})`

      const step = 4
      let firstPoint = true

      for (let x = -step; x <= width + step; x += step) {
        const n1 = smoothNoise(
          x * wave.frequency + t * wave.speed * 800,
          wave.noiseOffset
        )
        const n2 = smoothNoise(
          x * wave.frequency * 2.3 + t * wave.speed * 600,
          wave.noiseOffset + 100
        )
        const n3 = smoothNoise(
          x * wave.frequency * 0.4 + t * wave.speed * 200,
          wave.noiseOffset + 200
        )

        /* Weighted mix creates realistic price-like irregular movement */
        const y =
          wave.yBase +
          n1 * wave.amplitude * 0.6 +
          n2 * wave.amplitude * 0.25 +
          n3 * wave.amplitude * 0.15

        if (firstPoint) {
          ctx.moveTo(x, y)
          firstPoint = false
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
    }

    /* --- Ghost candlestick (tiny, sparse, atmospheric) --- */
    const drawGhostCandle = (x: number, y: number, opacity: number) => {
      const h = 8 + Math.random() * 16
      const w = 3
      const isGreen = Math.random() > 0.5
      const color = isGreen
        ? `rgba(48,209,88,${opacity * 0.4})`
        : `rgba(255,59,48,${opacity * 0.4})`

      ctx.fillStyle = color
      ctx.fillRect(x - w / 2, y - h / 2, w, h)

      /* Wick */
      ctx.strokeStyle = color
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(x, y - h / 2 - 4)
      ctx.lineTo(x, y + h / 2 + 4)
      ctx.stroke()
    }

    /* --- RAF loop --- */
    const tick = () => {
      ctx.clearRect(0, 0, width, height)
      time++
      candleTimer++

      /* Lerp each wave's current color toward the target palette (smooth mood swap) */
      const palette = targetPalette(levelRef.current)
      for (let i = 0; i < waves.length; i++) {
        const target = palette[waves[i].colorIdx % palette.length]
        currentColors[i] = lerpRGB(currentColors[i], target, 0.02)
      }

      /* Draw all wave lines */
      for (let i = 0; i < waves.length; i++) {
        drawWave(waves[i], currentColors[i], time)
      }

      /* Sparse ghost candles every N frames */
      if (candleTimer >= candleInterval) {
        candleTimer = 0
        for (let i = 0; i < waves.length; i++) {
          const wave = waves[i]
          if (Math.random() > 0.6) {
            const x = Math.random() * width
            const n1 = smoothNoise(
              x * wave.frequency + time * wave.speed * 800,
              wave.noiseOffset
            )
            const y = wave.yBase + n1 * wave.amplitude
            drawGhostCandle(x, y, wave.opacity)
          }
        }
      }

      /* Breathing — opacity pulses gently so the market "feels alive" */
      for (let i = 0; i < waves.length; i++) {
        const w = waves[i]
        const breathe = Math.sin(time * 0.008 + w.phase) * 0.02
        w.opacity = Math.max(0.04, Math.min(0.18, w.opacity + breathe * 0.001))
      }

      animId = requestAnimationFrame(tick)
    }

    resize()
    animId = requestAnimationFrame(tick)

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      waves = []
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

export default PriceWaves
