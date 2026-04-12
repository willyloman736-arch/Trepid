'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   GlassButton — jelly glass button with full inline Framer Motion
   spring physics. ALL hover/tap visuals are handled by Framer
   Motion whileHover/whileTap — zero CSS :hover/:active rules
   needed (those are stripped from globals.css btn-* classes).

   The "jelly" feel comes from:
   - whileHover: scale 1.04, lift -2px, boosted shadow
   - whileTap: scale 0.94, push +2px, compressed inset shadow
   - Spring transition with stiffness 500, damping 15, mass 0.8
     which causes a slight overshoot on release (the bounce)
   ============================================================ */

type Variant = 'primary' | 'ghost' | 'danger' | 'success'

interface GlassButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: Variant
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const JELLY_SPRING = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 15,
  mass: 0.8,
}

const SIZE_STYLES = {
  sm: { padding: '8px 16px', fontSize: 13, borderRadius: 10 },
  md: { padding: '12px 24px', fontSize: 15, borderRadius: 14 },
  lg: { padding: '16px 32px', fontSize: 17, borderRadius: 16 },
}

const VARIANT_STYLES: Record<
  Variant,
  { background: string; color: string; boxShadow: string }
> = {
  primary: {
    background: 'rgba(0, 122, 255, 0.9)',
    color: 'white',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,80,0.3), 0 4px 16px rgba(0,122,255,0.4), 0 2px 6px rgba(0,0,0,0.3)',
  },
  ghost: {
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.9)',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3)',
  },
  danger: {
    background: 'rgba(255,59,48,0.85)',
    color: 'white',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(80,0,0,0.3), 0 4px 16px rgba(255,59,48,0.35)',
  },
  success: {
    background: 'rgba(48,209,88,0.85)',
    color: 'white',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,60,0,0.3), 0 4px 16px rgba(48,209,88,0.35)',
  },
}

const HOVER_SHADOW: Record<Variant, string> = {
  primary:
    'inset 0 1px 0 rgba(255,255,255,0.4), 0 8px 24px rgba(0,122,255,0.5), 0 4px 12px rgba(0,0,0,0.35)',
  ghost:
    'inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 24px rgba(0,0,0,0.4)',
  danger:
    'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 24px rgba(255,59,48,0.5)',
  success:
    'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 24px rgba(48,209,88,0.5)',
}

const TAP_SHADOW =
  'inset 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      variant = 'primary',
      loading = false,
      size = 'md',
      className,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    const vs = VARIANT_STYLES[variant]
    const ss = SIZE_STYLES[size]
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        style={{
          ...ss,
          ...vs,
          position: 'relative',
          overflow: 'hidden',
          border: 'none',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          opacity: isDisabled ? 0.5 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          willChange: 'transform',
          transformOrigin: 'center center',
        }}
        /* THE JELLY EFFECT — all via Framer Motion springs */
        whileHover={
          isDisabled
            ? undefined
            : {
                scale: 1.04,
                y: -2,
                boxShadow: HOVER_SHADOW[variant],
                transition: { type: 'spring', stiffness: 500, damping: 25 },
              }
        }
        whileTap={
          isDisabled
            ? undefined
            : {
                scale: 0.94,
                y: 2,
                boxShadow: TAP_SHADOW,
                transition: { type: 'spring', stiffness: 800, damping: 20 },
              }
        }
        transition={JELLY_SPRING}
        className={className}
        {...(rest as Record<string, unknown>)}
      >
        {loading ? (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 14,
                height: 14,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                display: 'block',
              }}
            />
            {children}
          </span>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)

GlassButton.displayName = 'GlassButton'
