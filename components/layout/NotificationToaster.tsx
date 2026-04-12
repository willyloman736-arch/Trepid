'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon, IconName } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * Apple-style notification toasts.
 * Slide in from the top-right as frosted glass cards.
 */
export function NotificationToaster() {
  const notifications = useStore((s) => s.notifications)
  const markRead = useStore((s) => s.markNotificationRead)
  const settings = useStore((s) => s.notificationSettings)

  const visible = settings.inApp
    ? notifications.filter((n) => !n.read).slice(0, 3)
    : []

  useEffect(() => {
    if (visible.length === 0) return
    const timers = visible.map((n) => setTimeout(() => markRead(n.id), 5500))
    return () => timers.forEach(clearTimeout)
  }, [visible, markRead])

  const icon: Record<string, IconName> = {
    info: 'sparkles',
    success: 'check',
    warning: 'warning',
    danger: 'warning',
  }

  const colorHex = {
    info: '#007AFF',
    success: '#30D158',
    warning: '#FF9F0A',
    danger: '#FF3B30',
  }

  return (
    <div className="fixed top-20 right-6 z-50 space-y-2 w-[min(calc(100vw-3rem),360px)] pointer-events-none">
      <AnimatePresence>
        {visible.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 32, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 32, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass p-4 pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-[12px] grid place-items-center shrink-0"
                style={{
                  background: `${colorHex[n.tone]}18`,
                  color: colorHex[n.tone],
                }}
              >
                <Icon name={icon[n.tone]} className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-headline text-label leading-tight">{n.title}</p>
                <p className="text-footnote text-label-secondary mt-0.5 leading-relaxed">
                  {n.message}
                </p>
                {n.channel !== 'IN_APP' && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-label-tertiary mt-1">
                    via {n.channel}
                  </p>
                )}
              </div>
              <button
                onClick={() => markRead(n.id)}
                className="w-6 h-6 rounded-full grid place-items-center text-label-tertiary hover:bg-white/[0.06] transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <Icon name="close" className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
