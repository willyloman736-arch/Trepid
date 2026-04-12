'use client'

import { motion } from 'framer-motion'

/* ============================================================
   ProgressRing — Apple Watch-style circular progress indicator.
   Animates stroke-dashoffset on mount + when value changes.
   Supports optional center label/sublabel and a glow filter.
   ============================================================ */

export interface ProgressRingProps {
  /** Current progress value (same unit as max). */
  value: number
  /** Max value that represents 100% fill. */
  max: number
  /** Outer diameter in pixels. */
  size: number
  /** Ring stroke thickness. */
  strokeWidth: number
  /** Progress stroke color (hex / rgba). */
  color: string
  /** Unfilled track color. Default subtle white. */
  bgColor?: string
  /** Center label (big). */
  label?: string
  /** Center sublabel (small, tertiary). */
  sublabel?: string
  /** Disable the mount animation. */
  animate?: boolean
  /** Disable the glow drop-shadow filter. */
  glow?: boolean
  /** Optional extra className on wrapper. */
  className?: string
}

export function ProgressRing({
  value,
  max,
  size,
  strokeWidth,
  color,
  bgColor = 'rgba(255,255,255,0.08)',
  label,
  sublabel,
  animate = true,
  glow = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(value / max, 1))
  const offset = circumference - progress * circumference

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden={!label && !sublabel}
      >
        {/* Unfilled track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{
            filter: glow ? `drop-shadow(0 0 6px ${color}60)` : undefined,
          }}
        />
      </svg>

      {(label || sublabel) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {label && (
            <span
              style={{
                fontSize: Math.round(size * 0.24),
                fontWeight: 700,
                color: 'rgba(255,255,255,0.95)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {label}
            </span>
          )}
          {sublabel && (
            <span
              style={{
                fontSize: Math.round(size * 0.11),
                color: 'rgba(255,255,255,0.45)',
                marginTop: 2,
                fontWeight: 500,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* --- Color helpers --- */

/** For "higher = worse" metrics (trades count, loss, streak). */
export function ringColor(value: number, max: number): string {
  const pct = value / max
  if (pct >= 0.85) return '#FF3B30' // danger
  if (pct >= 0.6) return '#FF9F0A' // warning
  return '#30D158' // safe
}

/** For "higher = better" metrics (discipline score). */
export function scoreRingColor(score: number): string {
  if (score >= 80) return '#30D158'
  if (score >= 50) return '#FF9F0A'
  return '#FF3B30'
}
