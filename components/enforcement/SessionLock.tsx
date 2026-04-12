'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'
import { GlassButton } from '@/components/ui/GlassButton'
import { useStore } from '@/lib/store'
import { fmtMoney } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * Session Lock — full screen Apple-style takeover
 * White rounded card centered over a blurred dark background.
 */
export function SessionLock() {
  const enforcement = useStore((s) => s.enforcement)
  const session = useStore((s) => s.session)
  const unlock = useStore((s) => s.unlockSession)

  const locked = enforcement.level >= 5 && enforcement.locked

  return (
    <AnimatePresence>
      {locked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[85] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[40px]" />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass-modal relative z-10 w-full max-w-xl p-10 text-center"
          >
            {/* Padlock icon in red circle */}
            <div className="relative mx-auto mb-8 w-24 h-24">
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.25, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ background: 'rgba(255,59,48,0.4)', filter: 'blur(24px)' }}
              />
              <div
                className="relative w-full h-full rounded-full grid place-items-center"
                style={{
                  background: 'linear-gradient(135deg, #FF3B30 0%, #FF2D55 100%)',
                  boxShadow:
                    '0 20px 48px rgba(255,59,48,0.5), 0 0 0 8px rgba(255,59,48,0.12)',
                }}
              >
                <Icon
                  name="lock"
                  className="w-12 h-12 text-white"
                  strokeWidth={2.2}
                />
              </div>
            </div>

            <p className="text-[12px] font-semibold uppercase tracking-wider text-danger mb-3">
              Session Terminated
            </p>
            <h2 className="text-large-title text-label mb-3">
              Session closed for today.
            </h2>
            <p className="text-body text-label-secondary mb-8 max-w-md mx-auto leading-relaxed">
              {enforcement.message ||
                'You exceeded critical rules. Trepid has locked your session.'}
            </p>

            {/* Session summary */}
            <div className="rounded-[20px] bg-white/[0.05] p-5 mb-6 grid grid-cols-2 gap-5">
              <Summary label="Trades" value={session.totalTrades.toString()} />
              <Summary
                label="P&L"
                value={fmtMoney(session.totalPnl)}
                color={session.totalPnl >= 0 ? 'success' : 'danger'}
              />
              <Summary
                label="Violations"
                value={session.totalViolations.toString()}
                color={session.totalViolations > 0 ? 'danger' : undefined}
              />
              <Summary
                label="Discipline"
                value={`${session.disciplineScore}`}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/journal" className="flex-1">
                <GlassButton variant="ghost" className="w-full !py-3.5">
                  <Icon name="book-open" className="w-4 h-4" strokeWidth={2.2} />
                  Review Session
                </GlassButton>
              </Link>
              <GlassButton variant="primary" onClick={unlock} className="!py-3.5">
                Unlock (Demo)
              </GlassButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Summary({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: 'success' | 'danger'
}) {
  return (
    <div className="text-left">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-label-tertiary mb-1">
        {label}
      </p>
      <p
        className={cn(
          'text-[22px] font-bold tabular-nums tracking-tight',
          color === 'success' && 'text-success',
          color === 'danger' && 'text-danger',
          !color && 'text-label'
        )}
      >
        {value}
      </p>
    </div>
  )
}
