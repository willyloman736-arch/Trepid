'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface GlassModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
  hideClose?: boolean
  glow?: 'accent' | 'warning' | 'success' | 'danger' | 'none'
  className?: string
  dismissible?: boolean
  variant?: 'light' | 'dark'
}

export function GlassModal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  hideClose = false,
  glow = 'none',
  className,
  dismissible = true,
  variant = 'light',
}: GlassModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose, dismissible])

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
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={() => dismissible && onClose()}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              variant === 'dark' ? 'glass-dark' : 'glass-modal',
              'relative z-10 w-full p-8',
              maxWidth,
              glowClass,
              className
            )}
          >
            {!hideClose && dismissible && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-full grid place-items-center bg-white/[0.08] hover:bg-white/[0.14] text-label-secondary hover:text-label transition-colors"
                aria-label="Close"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
