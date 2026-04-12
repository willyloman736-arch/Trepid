'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'
import { fmtClock } from '@/lib/utils'

/**
 * Floating cooldown indicator — docks to the bottom-center
 * below the TopBar pill and glows warning-orange.
 */
export function CooldownTimer() {
  const enforcement = useStore((s) => s.enforcement)
  const tickCooldown = useStore((s) => s.tickCooldown)
  const [remaining, setRemaining] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)

  useEffect(() => {
    if (!enforcement.cooldownEndsAt) {
      setRemaining(0)
      return
    }
    const end = new Date(enforcement.cooldownEndsAt).getTime()
    const start = Date.now()
    const total = Math.max(1, Math.ceil((end - start) / 1000))
    setTotalSeconds(total)

    const update = () => {
      const r = Math.max(0, Math.floor((end - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) tickCooldown()
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [enforcement.cooldownEndsAt, tickCooldown])

  const active = remaining > 0 && enforcement.cooldownEndsAt
  const pct = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
        >
          <div
            className="flex items-center gap-4 px-5 py-3 rounded-[22px] border border-white/15"
            style={{
              background: 'rgba(28, 28, 30, 0.85)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              boxShadow:
                '0 12px 40px rgba(255,159,10,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            <motion.div
              className="relative w-10 h-10 rounded-[12px] grid place-items-center shrink-0"
              style={{
                background: 'rgba(255,159,10,0.2)',
                border: '1px solid rgba(255,159,10,0.4)',
              }}
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Icon name="lock" className="w-5 h-5 text-warning" strokeWidth={2.2} />
            </motion.div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-warning">
                Cooldown Active
              </p>
              <p className="text-[26px] font-bold tabular-nums text-white leading-tight tracking-tight">
                {fmtClock(remaining)}
              </p>
            </div>

            <div className="hidden sm:block w-40">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #FF9F0A 0%, #FF6F0A 100%)',
                  }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[11px] mt-1.5 text-white/55 font-medium">
                Step away from the charts
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
