'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'

/**
 * Mocked "morning priming" routine.
 * On the real system, a scheduled cron would fire at 8am local time.
 * Here we simulate it: if the user opens the dashboard and the
 * notification setting is enabled and the previous session had violations,
 * we fire a single priming notification.
 */
export function useMorningPriming() {
  const fired = useRef(false)
  const settings = useStore((s) => s.notificationSettings)
  const violations = useStore((s) => s.violations)
  const pushNotification = useStore((s) => s.pushNotification)
  const user = useStore((s) => s.user)

  useEffect(() => {
    if (!settings.morningPriming || fired.current || !user) return

    // Only fire once per mount
    fired.current = true

    // Delay so the page has mounted
    const id = setTimeout(() => {
      const state = useStore.getState()
      const hasRecentPriming = state.notifications.some(
        (n) => n.title === 'Morning priming' &&
          Date.now() - new Date(n.timestamp).getTime() < 8 * 3600 * 1000
      )
      if (hasRecentPriming) return

      let message: string
      if (state.violations.length === 0) {
        message = 'Clean yesterday. Take only valid setups today. Quality over quantity.'
      } else {
        const recent = state.violations[0]
        if (recent.type === 'REVENGE_TRADING') {
          message = 'Yesterday you revenge traded. Today: no trades within 10 min of a loss.'
        } else if (
          recent.type === 'MAX_TRADES_EXCEEDED' ||
          recent.type === 'OVERTRADING'
        ) {
          message = 'Yesterday you overtraded. Today: hard stop at your cap. No exceptions.'
        } else if (recent.type === 'LOSS_STREAK') {
          message = 'Yesterday you broke loss streak discipline. Today: stop after 2 losses.'
        } else {
          message = 'Review your rules. Yesterday you broke discipline. Today, choose better.'
        }
      }

      pushNotification({
        title: 'Morning priming',
        message,
        tone: 'info',
        channel: 'IN_APP',
      })
    }, 1400)

    return () => clearTimeout(id)
  }, [settings.morningPriming, violations, pushNotification, user])
}
