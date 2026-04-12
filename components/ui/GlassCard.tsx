'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, useCallback } from 'react'
import { useLiquidGlass } from '@/hooks/useLiquidGlass'
import { cn } from '@/lib/utils'

/* ============================================================
   GlassCard — liquid glass surface with cursor-tracking specular
   highlight and optional 3D tilt on hover. The tilt + specular
   are powered by the useLiquidGlass hook; the visual appearance
   comes from the .glass / .glass-dark / .glass-modal CSS class
   which is now the liquid glass formula (translucent, stars
   show through, gradient border, cascading shadows).

   All 10+ consumer files keep working unchanged — the props
   interface is backward-compatible (only `tilt` is new, defaults
   to true).
   ============================================================ */

type Glow = 'none' | 'accent' | 'success' | 'warning' | 'danger'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode
  glow?: Glow
  padding?: string
  hover?: boolean
  interactive?: boolean
  variant?: 'light' | 'dark' | 'modal'
  /** Enable 3D tilt + cursor-tracking specular. Default true. */
  tilt?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      glow = 'none',
      padding = 'p-6',
      hover = true,
      interactive = false,
      variant = 'light',
      tilt = true,
      className,
      style: styleProp,
      ...rest
    },
    forwardedRef
  ) => {
    const base =
      variant === 'dark'
        ? 'glass-dark'
        : variant === 'modal'
          ? 'glass-modal'
          : 'glass'

    const glowClass =
      glow === 'accent'
        ? 'glow-accent'
        : glow === 'success'
          ? 'glow-success'
          : glow === 'warning'
            ? 'glow-warning'
            : glow === 'danger'
              ? 'glow-danger'
              : ''

    /* Liquid glass hook — tilt + specular tracking.
       Disabled for modals (they don't tilt) and when tilt=false. */
    const shouldTilt = tilt && variant !== 'modal'
    const { ref: glassRef, style: glassStyle, handlers } = useLiquidGlass({
      maxTilt: shouldTilt ? 6 : 0,
      enabled: shouldTilt,
    })

    /* Merge the forwarded ref with the hook's ref */
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        // Assign to hook ref
        ;(glassRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        // Assign to forwarded ref
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef) {
          ;(forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      },
      [glassRef, forwardedRef]
    )

    return (
      <motion.div
        ref={mergedRef}
        className={cn(
          base,
          'relative',
          padding,
          glowClass,
          hover && 'glass-interactive',
          interactive && 'cursor-pointer',
          className
        )}
        style={{ ...glassStyle, ...styleProp }}
        {...(shouldTilt ? handlers : {})}
        {...rest}
      >
        {/* Content sits above the ::before border + ::after specular */}
        <div className="relative z-[3]">{children}</div>
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
