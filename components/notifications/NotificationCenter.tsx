'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'
import { slidePanelVariants, overlayVariants } from '@/lib/animation'
import { cn } from '@/lib/utils'
import type { NotificationRecord } from '@/types'

/* ============================================================
   NotificationCenter — slide-in right panel.
   Groups notifications by day, pulses red badge while unread
   count > 0. Mark-all-read on open, clear button, deep link
   to journal for full history.
   ============================================================ */

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const notifications = useStore((s) => s.notifications)
  const markRead = useStore((s) => s.markNotificationRead)
  const clearAll = useStore((s) => s.clearNotifications)

  /* Mark all read when panel opens */
  useEffect(() => {
    if (!open) return
    notifications.forEach((n) => {
      if (!n.read) markRead(n.id)
    })
  }, [open, notifications, markRead])

  /* Esc to close */
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  /* Group by day label (Today / Yesterday / This week / Older) */
  const grouped = useMemo(() => groupByDay(notifications), [notifications])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notif-overlay"
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-[110]"
            style={{
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* Slide panel */}
          <motion.aside
            key="notif-panel"
            variants={slidePanelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 z-[111] w-full max-w-[380px] flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(22,28,44,0.92) 0%, rgba(12,16,26,0.92) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '-32px 0 64px rgba(0,0,0,0.5)',
            }}
            aria-label="Notifications"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-title-3 text-label leading-tight">
                  Notifications
                </h2>
                <p className="text-[11px] text-label-tertiary mt-0.5">
                  {notifications.length}{' '}
                  {notifications.length === 1 ? 'event' : 'events'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[12px] font-semibold text-label-secondary hover:text-label transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full grid place-items-center bg-white/[0.08] hover:bg-white/[0.14] text-label-secondary hover:text-label transition-colors"
                  aria-label="Close"
                >
                  <Icon name="close" className="w-3.5 h-3.5" strokeWidth={2.4} />
                </button>
              </div>
            </header>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div
                    className="text-[44px] mb-3"
                    style={{
                      color: '#30D158',
                      filter: 'drop-shadow(0 0 12px rgba(48,209,88,0.4))',
                    }}
                  >
                    ◉
                  </div>
                  <h3 className="text-[16px] font-bold text-label mb-1">
                    All clear.
                  </h3>
                  <p className="text-[13px] text-label-tertiary leading-relaxed max-w-[240px]">
                    No violations, no alerts. Clean trading.
                  </p>
                </div>
              ) : (
                grouped.map(([group, items]) => (
                  <section key={group}>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-label-tertiary px-5 pt-5 pb-2">
                      {group}
                    </h3>
                    <div className="divide-y divide-white/[0.06]">
                      {items.map((n) => (
                        <NotificationRow key={n.id} n={n} />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>

            {/* Footer link */}
            <footer className="border-t border-white/[0.08] p-4">
              <a
                href="/journal"
                className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                View all in Journal
                <Icon name="arrow-right" className="w-3.5 h-3.5" strokeWidth={2.4} />
              </a>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

/* ============================================================
   Single notification row
   ============================================================ */
function NotificationRow({ n }: { n: NotificationRecord }) {
  const { tone } = n
  const iconName =
    tone === 'danger' ? 'alert-triangle' : tone === 'warning' ? 'warning' : tone === 'success' ? 'check-circle' : 'bell'
  const colorHex =
    tone === 'danger'
      ? '#FF3B30'
      : tone === 'warning'
        ? '#FF9F0A'
        : tone === 'success'
          ? '#30D158'
          : '#4F6EF7'

  const time = new Date(n.timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors"
    >
      <div
        className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
        style={{
          background: `${colorHex}22`,
          color: colorHex,
        }}
      >
        <Icon name={iconName} className="w-4 h-4" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn('text-[13px] font-semibold text-label truncate flex-1')}>
            {n.title}
          </p>
          <span className="text-[11px] text-label-tertiary shrink-0 tabular-nums">
            {time}
          </span>
        </div>
        <p className="text-[12px] text-label-secondary leading-snug line-clamp-2">
          {n.message}
        </p>
      </div>
    </motion.div>
  )
}

/* ============================================================
   Group helpers
   ============================================================ */
function groupByDay(
  items: NotificationRecord[]
): [string, NotificationRecord[]][] {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const groups: Record<string, NotificationRecord[]> = {
    Today: [],
    Yesterday: [],
    'This week': [],
    Older: [],
  }

  items.forEach((n) => {
    const d = new Date(n.timestamp)
    if (isSameDay(d, today)) groups.Today.push(n)
    else if (isSameDay(d, yesterday)) groups.Yesterday.push(n)
    else if (d >= weekAgo) groups['This week'].push(n)
    else groups.Older.push(n)
  })

  return Object.entries(groups).filter(([, arr]) => arr.length > 0)
}
