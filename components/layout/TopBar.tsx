'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'
import { fmtClock } from '@/lib/utils'
import { LEVEL_LABELS } from '@/lib/enforcement-engine'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * Floating Dynamic-Island-style pill at the top center of the viewport.
 * Shows enforcement level, session timer, ⌘K command palette trigger,
 * bell icon with notification badge, and log-trade CTA.
 * Pulses + glows when the session is in violation.
 */
export function TopBar() {
  const session = useStore((s) => s.session)
  const enforcement = useStore((s) => s.enforcement)
  const unreadCount = useStore(
    (s) => s.notifications.filter((n) => !n.read).length
  )
  const [sessionSeconds, setSessionSeconds] = useState(0)

  useEffect(() => {
    const startTime = new Date(session.startedAt).getTime()
    const id = setInterval(() => {
      setSessionSeconds(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [session.startedAt])

  const inViolation = enforcement.level >= 3
  const isCritical = enforcement.level >= 5

  const dotColor =
    enforcement.level === 0
      ? '#30D158'
      : enforcement.level <= 2
        ? '#FF9F0A'
        : '#FF3B30'

  /* Platform-aware modifier hint */
  const [isMac, setIsMac] = useState(false)
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform))
  }, [])

  const { isOnline } = useOnlineStatus()

  const openPalette = () =>
    window.dispatchEvent(new CustomEvent('trepid:open-palette'))
  const openNotif = () =>
    window.dispatchEvent(new CustomEvent('trepid:open-notifications'))

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="topbar-pill glass-dark flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2 !rounded-full"
        style={{
          boxShadow: isCritical
            ? '0 0 0 1px rgba(255,59,48,0.4), 0 8px 24px rgba(255,59,48,0.5), 0 16px 48px rgba(255,59,48,0.3)'
            : inViolation
              ? '0 0 0 1px rgba(255,159,10,0.35), 0 8px 24px rgba(255,159,10,0.4), 0 16px 48px rgba(255,159,10,0.25)'
              : undefined,
        }}
      >
        {/* Offline indicator */}
        {!isOnline && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-warning relative z-[2]">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            Offline
          </span>
        )}

        {/* Level indicator */}
        <div className="flex items-center gap-2 min-w-0 relative z-[2]">
          <span className="relative flex w-2 h-2">
            {enforcement.level > 0 && (
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: dotColor }}
              />
            )}
            <span
              className="relative rounded-full w-2 h-2"
              style={{ backgroundColor: dotColor }}
            />
          </span>
          <span className="text-[12px] font-semibold text-white/90 tracking-tight">
            Lv {enforcement.level}
          </span>
          <span className="topbar-level-label text-[12px] text-white/50 tracking-tight hidden sm:inline">
            · {LEVEL_LABELS[enforcement.level]}
          </span>
        </div>

        {/* Separator — hidden on mobile (timer is hidden) */}
        <div className="topbar-hide-mobile w-px h-4 bg-white/15 relative z-[2]" />

        {/* Session timer — hidden on mobile */}
        <div className="topbar-session-timer flex items-center gap-1.5 relative z-[2]">
          <Icon name="clock" className="w-3 h-3 text-white/50" strokeWidth={2} />
          <span className="text-[12px] font-mono text-white/85 tabular-nums tracking-tight">
            {fmtClock(sessionSeconds)}
          </span>
        </div>

        {/* Separator */}
        <div className="topbar-hide-mobile w-px h-4 bg-white/15 hidden sm:block relative z-[2]" />

        {/* ⌘K command palette pill */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={openPalette}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] transition-colors relative z-[2]"
          aria-label="Open command palette"
        >
          <Icon name="search" className="w-3 h-3 text-white/60" strokeWidth={2.2} />
          <span className="text-[11px] font-semibold text-white/70 tracking-tight">
            {isMac ? '⌘' : 'Ctrl'}K
          </span>
        </motion.button>

        {/* Bell icon with unread badge */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          onClick={openNotif}
          className="relative w-8 h-8 rounded-full grid place-items-center bg-white/[0.06] hover:bg-white/[0.14] transition-colors z-[2]"
          aria-label="Open notifications"
        >
          <Icon name="bell" className="w-3.5 h-3.5 text-white/80" strokeWidth={2.2} />
          {unreadCount > 0 && (
            <span className="notif-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>

        {/* Separator */}
        <div className="w-px h-4 bg-white/15 hidden sm:block relative z-[2]" />

        {/* Log trade CTA */}
        <Link href="/journal" className="hidden sm:block relative z-[2]">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-white text-[12px] font-semibold shadow-[0_2px_8px_rgba(79,110,247,0.5)] hover:bg-accent-hover transition-colors"
          >
            <Icon name="plus" className="w-3 h-3" strokeWidth={2.5} />
            Log Trade
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  )
}
