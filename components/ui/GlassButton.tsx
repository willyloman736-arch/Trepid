'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   GlassButton — jelly glass button with spring compress on press.
   Uses Framer Motion's `whileTap` for the bouncy scale-down that
   overshoots slightly on release (the "jelly" feel). The visual
   appearance comes from the CSS class (.btn-primary etc.) which
   now uses the liquid glass formula (translucent surface, inset
   specular edges, colored glow shadows).

   The props interface is unchanged — all 10 consumers keep working.
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
    const variantClass =
      variant === 'primary'
        ? 'btn-primary'
        : variant === 'ghost'
          ? 'btn-ghost'
          : variant === 'danger'
            ? 'btn-danger'
            : 'btn-success'

    const sizeClass =
      size === 'sm'
        ? '!px-4 !py-2 !text-[13px] !rounded-[10px]'
        : size === 'lg'
          ? '!px-7 !py-4 !text-[17px] !rounded-[16px]'
          : ''

    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        className={cn(variantClass, sizeClass, className)}
        /* Jelly compress on press — scale overshoots on release */
        whileTap={
          disabled || loading
            ? undefined
            : { scale: 0.92, transition: JELLY_SPRING }
        }
        transition={JELLY_SPRING}
        {...(rest as Record<string, unknown>)}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <motion.span
              className="w-4 h-4 rounded-full border-2 border-current border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
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
