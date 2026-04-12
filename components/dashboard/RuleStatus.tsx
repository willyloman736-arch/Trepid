'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function RuleStatus() {
  const rules = useStore((s) => s.rules)
  const trades = useStore((s) => s.trades)

  const getCurrent = (type: string): { value: number; over: boolean; limit: number } | null => {
    const rule = rules.find((r) => r.type === type)
    if (!rule) return null

    switch (type) {
      case 'MAX_TRADES_PER_DAY':
        return { value: trades.length, over: trades.length > rule.value, limit: rule.value }
      case 'MAX_DAILY_LOSS': {
        const loss = -trades
          .filter((t) => t.pnl < 0)
          .reduce((a, t) => a + t.pnl, 0)
        return { value: loss, over: loss > rule.value, limit: rule.value }
      }
      case 'MAX_CONSECUTIVE_LOSSES': {
        let streak = 0
        for (const t of trades) {
          if (t.result === 'LOSS') streak++
          else break
        }
        return { value: streak, over: streak >= rule.value, limit: rule.value }
      }
      default:
        return null
    }
  }

  const shown = [
    'MAX_TRADES_PER_DAY',
    'MAX_DAILY_LOSS',
    'MAX_CONSECUTIVE_LOSSES',
    'NO_REVENGE_TRADING',
  ]

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-title-3 text-label">Active Rules</h3>
          <p className="text-footnote text-label-secondary mt-0.5">
            Live status on your boundaries
          </p>
        </div>
        <Link
          href="/rules"
          className="text-[14px] font-semibold text-accent hover:text-accent-hover transition-colors"
        >
          Edit
        </Link>
      </div>

      {/* iOS Settings style grouped rows inside one card */}
      <div className="rounded-[14px] bg-white/[0.04] overflow-hidden">
        {shown.map((t, i) => {
          const rule = rules.find((r) => r.type === t)
          if (!rule || !rule.enabled) return null
          const current = getCurrent(t)
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'flex items-center justify-between gap-4 px-4 py-3.5',
                i > 0 && 'border-t border-white/[0.08]'
              )}
            >
              {/* Icon + label */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-[8px] grid place-items-center shrink-0',
                    current?.over
                      ? 'bg-danger/15 text-danger'
                      : 'bg-accent/12 text-accent'
                  )}
                >
                  <Icon name="shield-check" className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-label truncate">
                    {rule.name}
                  </p>
                  <p className="text-[12px] text-label-secondary truncate">
                    {rule.description}
                  </p>
                </div>
              </div>

              {/* Right value */}
              <div className="text-right shrink-0">
                {current ? (
                  <>
                    <p
                      className={cn(
                        'text-[15px] font-semibold tabular-nums',
                        current.over ? 'text-danger' : 'text-label'
                      )}
                    >
                      {current.value} / {current.limit}
                    </p>
                    <p
                      className={cn(
                        'text-[11px] font-semibold uppercase tracking-wider',
                        current.over ? 'text-danger' : 'text-success'
                      )}
                    >
                      {current.over ? 'Broken' : 'OK'}
                    </p>
                  </>
                ) : (
                  <p className="text-[12px] text-label-tertiary">Monitoring</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
