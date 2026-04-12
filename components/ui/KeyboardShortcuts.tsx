'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { modalVariants, overlayVariants } from '@/lib/animation'

/* ============================================================
   KeyboardShortcuts — overlay triggered by "?" key.
   Displays all global shortcuts in a two-column grid.
   Closes on Escape, clicking backdrop, or pressing ? again.
   ============================================================ */

interface Shortcut {
  keys: string[]
  action: string
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['⌘', 'K'], action: 'Command palette' },
  { keys: ['⌘', '/'], action: 'Ask companion' },
  { keys: ['L'], action: 'Log a trade' },
  { keys: ['R'], action: 'View rules' },
  { keys: ['J'], action: 'View journal' },
  { keys: ['A'], action: 'View analytics' },
  { keys: ['C'], action: 'Open companion' },
  { keys: ['S'], action: 'Session stats' },
  { keys: ['?'], action: 'Show shortcuts' },
  { keys: ['Esc'], action: 'Close / dismiss' },
]

interface KeyboardShortcutsProps {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  /* Esc to close */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  /* Lock body scroll */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="kbd-overlay"
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-[115] flex items-center justify-center px-4"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            key="kbd-panel"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="glass-modal relative w-full max-w-2xl"
            style={{ borderRadius: '20px' }}
            role="dialog"
            aria-label="Keyboard shortcuts"
          >
            <div className="relative z-[2]">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-title-2 text-label tracking-tight">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-footnote text-label-secondary mt-1">
                    Move through Trepid without lifting your hands.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[12px] font-semibold text-label-secondary transition-colors"
                  aria-label="Close shortcuts"
                >
                  Esc
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {SHORTCUTS.map((s) => (
                  <div
                    key={s.action}
                    className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-b-0"
                  >
                    <span className="text-[14px] text-label-secondary font-medium">
                      {s.action}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {s.keys.map((k) => (
                        <kbd key={k}>{k}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-label-tertiary text-center mt-6 pt-4 border-t border-white/[0.06]">
                Press{' '}
                <kbd className="mx-1">?</kbd> any time to reopen this panel.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
