'use client'

import { cn } from '@/lib/utils'

interface GlassPanelProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  glow?: 'accent' | 'warning' | 'success' | 'danger' | 'none'
}

export function GlassPanel({
  children,
  title,
  subtitle,
  action,
  className,
  glow = 'none',
}: GlassPanelProps) {
  const glowClass =
    glow === 'accent'
      ? 'shadow-glow-accent'
      : glow === 'warning'
        ? 'shadow-glow-warning'
        : glow === 'success'
          ? 'shadow-glow-success'
          : glow === 'danger'
            ? 'shadow-glow-danger'
            : ''
  return (
    <section className={cn('glass p-6', glowClass, className)}>
      {(title || action) && (
        <header className="flex items-start justify-between mb-5">
          <div>
            {title && (
              <h2 className="text-title-3 text-label tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="text-footnote text-label-secondary mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
