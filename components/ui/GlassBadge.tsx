'use client'

import { cn } from '@/lib/utils'

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'slate'

interface GlassBadgeProps {
  tone?: Tone
  icon?: React.ReactNode
  children: React.ReactNode
  pulse?: boolean
  className?: string
}

const DOT_COLOR: Record<Tone, string> = {
  accent: '#007AFF',
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF3B30',
  slate: 'rgba(60, 60, 67, 0.6)',
}

export function GlassBadge({
  tone = 'slate',
  icon,
  children,
  pulse = false,
  className,
}: GlassBadgeProps) {
  const toneClass =
    tone === 'accent'
      ? 'chip-accent'
      : tone === 'success'
        ? 'chip-success'
        : tone === 'warning'
          ? 'chip-warning'
          : tone === 'danger'
            ? 'chip-danger'
            : 'chip-slate'

  return (
    <span className={cn('chip', toneClass, className)}>
      {pulse ? (
        <span className="relative flex w-1.5 h-1.5">
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: DOT_COLOR[tone] }}
          />
          <span
            className="relative rounded-full w-1.5 h-1.5"
            style={{ backgroundColor: DOT_COLOR[tone] }}
          />
        </span>
      ) : icon ? (
        icon
      ) : (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: DOT_COLOR[tone] }}
        />
      )}
      {children}
    </span>
  )
}
