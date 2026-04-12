'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
} from 'framer-motion'

/* ============================================================
   useLiquidGlass — cursor-tracking specular + 3D tilt hook.

   Attach to any glass element to get:
   1. Specular highlight that follows the cursor (--mouse-x/y CSS vars)
   2. 3D perspective tilt toward cursor (Framer Motion springs)
   3. Touch-device detection (skips tilt, keeps specular via touch)
   4. Reduced-motion detection (disables all tracking)

   Usage:
     const { ref, style, handlers } = useLiquidGlass()
     <motion.div ref={ref} style={style} {...handlers}>
   ============================================================ */

interface UseLiquidGlassOptions {
  /** Max tilt degrees (0 = disable tilt). Default 6. */
  maxTilt?: number
  /** Spring config for tilt interpolation. */
  stiffness?: number
  damping?: number
  /** Whether this element should tilt. Default true. */
  enabled?: boolean
}

interface UseLiquidGlassReturn {
  ref: React.RefObject<HTMLDivElement | null>
  /** Spread onto motion.div's style prop — contains rotateX/Y/perspective. */
  style: MotionStyle
  /** Spread onto the element — { onMouseMove, onMouseLeave } */
  handlers: {
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
    onMouseLeave: () => void
  }
}

export function useLiquidGlass(
  options: UseLiquidGlassOptions = {}
): UseLiquidGlassReturn {
  const { maxTilt = 6, stiffness = 400, damping = 30, enabled = true } = options

  const ref = useRef<HTMLDivElement | null>(null)
  const isTouchRef = useRef(false)
  const reducedMotionRef = useRef(false)

  /* Detect touch device + reduced-motion preference on mount */
  useEffect(() => {
    if (typeof window === 'undefined') return
    isTouchRef.current =
      'ontouchstart' in window || navigator.maxTouchPoints > 0
    reducedMotionRef.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  }, [])

  /* Raw motion values — normalized 0→1 relative to element bounds */
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  /* Spring-smoothed interpolation for the tilt */
  const springX = useSpring(mouseX, { stiffness, damping })
  const springY = useSpring(mouseY, { stiffness, damping })

  /* Map spring values → tilt degrees */
  const tiltDeg = enabled ? maxTilt : 0
  const rotateX = useTransform(springY, [0, 1], [tiltDeg, -tiltDeg])
  const rotateY = useTransform(springX, [0, 1], [-tiltDeg, tiltDeg])

  /* RAF ref for throttling mouse-move writes */
  const rafRef = useRef(0)

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || isTouchRef.current || reducedMotionRef.current) return
      const el = ref.current
      if (!el) return

      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height

        /* Update motion values (drives tilt spring) */
        mouseX.set(x)
        mouseY.set(y)

        /* Update CSS custom properties (drives ::after specular in CSS) */
        el.style.setProperty('--mouse-x', `${(x * 100).toFixed(1)}%`)
        el.style.setProperty('--mouse-y', `${(y * 100).toFixed(1)}%`)
      })
    },
    [enabled, mouseX, mouseY]
  )

  const onMouseLeave = useCallback(() => {
    if (!enabled) return
    const el = ref.current
    cancelAnimationFrame(rafRef.current)

    /* Spring back to center */
    mouseX.set(0.5)
    mouseY.set(0.5)

    /* Reset specular to default position */
    if (el) {
      el.style.setProperty('--mouse-x', '50%')
      el.style.setProperty('--mouse-y', '30%')
    }
  }, [enabled, mouseX, mouseY])

  /* Cleanup RAF on unmount */
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  /* Style object for motion.div — includes tilt + perspective.
     When disabled or on touch, rotateX/Y stays at 0 (center). */
  const style: MotionStyle =
    enabled && !isTouchRef.current
      ? { rotateX, rotateY, transformPerspective: 800 }
      : {}

  return {
    ref,
    style,
    handlers: { onMouseMove, onMouseLeave },
  }
}
