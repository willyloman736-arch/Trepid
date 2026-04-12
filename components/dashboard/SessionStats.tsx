'use client'

import { motion } from 'framer-motion'
import { Icon, IconName } from '@/components/ui/Icon'
import { ProgressRing, ringColor } from '@/components/ui/ProgressRing'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  /** Human-readable value (for fmtMoney, strings, etc) */
  value: string
  /** Raw numeric value — enables the animated number spring */
  numericValue?: number
  /** Numeric formatter for AnimatedNumber (maps int → display string) */
  format?: (n: number) => string
  sub?: string
  icon: IconName
  accent?: 'accent' | 'success' | 'warning' | 'danger' | 'slate'
  /** Progress percent 0-100 — if provided, renders a ProgressRing */
  progress?: number
  /** Progress ring raw value (for ring color calculation) */
  ringValue?: number
  ringMax?: number
  over?: boolean
  delay?: number
}

const DOT_COLOR: Record<string, string> = {
  accent: '#4F6EF7',
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF3B30',
  slate: 'rgba(255,255,255,0.3)',
}

export function StatCard({
  label,
  value,
  numericValue,
  format,
  sub,
  icon,
  accent = 'slate',
  progress,
  ringValue,
  ringMax,
  over,
  delay = 0,
}: StatCardProps) {
  const dotColor = DOT_COLOR[accent]

  /* Ring color: use raw value if available, else derive from progress */
  const ringStrokeColor =
    ringValue !== undefined && ringMax !== undefined
      ? ringColor(ringValue, ringMax)
      : progress !== undefined
        ? progress >= 85
          ? '#FF3B30'
          : progress >= 60
            ? '#FF9F0A'
            : '#30D158'
        : dotColor

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -3 }}
      className="stat-card glass glass-interactive p-6 relative overflow-hidden h-full"
    >
      {/* Label + dot */}
      <div className="flex items-start justify-between mb-4 relative z-[2]">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-label-tertiary">
          {label}
        </p>
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
          style={{
            backgroundColor: dotColor,
            boxShadow: `0 0 12px ${dotColor}55`,
          }}
        />
      </div>

      {/* Value + optional ring side-by-side */}
      <div className="flex items-center justify-between gap-4 relative z-[2]">
        <div className="min-w-0 flex-1">
          {numericValue !== undefined ? (
            <AnimatedNumber
              value={numericValue}
              format={format ?? ((n) => n.toString())}
              className="stat-card-value block text-[34px] font-bold text-label tabular-nums tracking-tight leading-none"
            />
          ) : (
            <div className="stat-card-value text-[34px] font-bold text-label tabular-nums tracking-tight leading-none truncate">
              {value}
            </div>
          )}

          {sub && (
            <p
              className={cn(
                'text-[13px] mt-2 font-medium',
                over ? 'text-danger' : 'text-label-secondary'
              )}
            >
              {sub}
            </p>
          )}
        </div>

        {/* Progress ring on the right when progress is present */}
        {typeof progress === 'number' && (
          <div className="shrink-0">
            <ProgressRing
              value={Math.min(progress, 100)}
              max={100}
              size={54}
              strokeWidth={5}
              color={ringStrokeColor}
              label={`${Math.round(progress)}`}
              sublabel="%"
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
