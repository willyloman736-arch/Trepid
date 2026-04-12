'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSpring, useTransform, type MotionValue } from 'framer-motion'

/* ============================================================
   useMicroAnimation — haptic-style feedback hooks
   Provides button/card ripple states and AnimatedNumber helpers.
   ============================================================ */

/**
 * useRipple — returns [trigger, active] where calling trigger()
 * sets active=true for `duration` ms then clears it. Used to apply
 * the .success-ripple class to an element as a one-shot animation.
 */
export function useRipple(duration = 600): [() => void, boolean] {
  const [active, setActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trigger = useCallback(() => {
    setActive(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setActive(false), duration)
  }, [duration])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return [trigger, active]
}

/**
 * useAnimatedNumber — smoothly springs a number between values.
 * Returns a MotionValue<number> that updates as `value` changes.
 * Usage:
 *   const spring = useAnimatedNumber(score)
 *   return <motion.span>{spring}</motion.span>
 */
export function useAnimatedNumber(value: number): MotionValue<number> {
  const spring = useSpring(value, { stiffness: 100, damping: 30 })
  useEffect(() => {
    spring.set(value)
  }, [spring, value])
  return useTransform(spring, (v) => Math.round(v))
}

/**
 * useShake — returns [trigger, shakeKey] pair. Increment a key
 * every time trigger is called, pass it to a motion component
 * with `animate={{ x: ... }}` keyed off shakeKey to re-fire.
 */
export function useShake(): [() => void, number] {
  const [key, setKey] = useState(0)
  const trigger = useCallback(() => setKey((k) => k + 1), [])
  return [trigger, key]
}
