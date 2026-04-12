'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { TradeForm } from '@/components/journal/TradeForm'
import { useStore, useSnapshot } from '@/lib/store'
import { fmtMoney } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function JournalPage() {
  const { trades, wins, losses, totalPnl, winRate } = useSnapshot()
  const [formOpen, setFormOpen] = useState(true)

  const emotionStats = trades.reduce<
    Record<string, { count: number; pnl: number }>
  >((acc, t) => {
    if (!acc[t.emotion]) acc[t.emotion] = { count: 0, pnl: 0 }
    acc[t.emotion].count++
    acc[t.emotion].pnl += t.pnl
    return acc
  }, {})
  const worstEmotion = Object.entries(emotionStats).sort(
    (a, b) => a[1].pnl - b[1].pnl
  )[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-large-title text-label">Journal</h1>
        <p className="text-callout text-label-secondary mt-1">
          Every trade, every decision, recorded.
        </p>
      </div>

      {/* Log trade form */}
      <GlassCard padding="p-0" hover={false}>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="w-full flex items-center justify-between p-6 hover:bg-white/[0.03] transition-colors rounded-card"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[12px] bg-accent/12 grid place-items-center">
              <Icon name="plus" className="w-5 h-5 text-accent" strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <h3 className="text-headline text-label">Log a Trade</h3>
              <p className="text-footnote text-label-secondary">
                Rule check runs on submit
              </p>
            </div>
          </div>
          <Icon
            name="chevron-down"
            className={cn(
              'w-5 h-5 text-label-tertiary transition-transform',
              formOpen && 'rotate-180'
            )}
            strokeWidth={2}
          />
        </button>

        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-6 pb-6 border-t border-white/[0.08]"
          >
            <div className="pt-6">
              <TradeForm />
            </div>
          </motion.div>
        )}
      </GlassCard>

      {/* Analytics strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StripCard label="Total Trades" value={trades.length.toString()} />
        <StripCard
          label="Win Rate"
          value={`${winRate}%`}
          sub={`${wins}W / ${losses}L`}
        />
        <StripCard
          label="Net P&L"
          value={fmtMoney(totalPnl)}
          color={totalPnl >= 0 ? 'success' : 'danger'}
        />
        <StripCard
          label="Worst Emotion"
          value={worstEmotion ? worstEmotion[0] : '—'}
          sub={worstEmotion ? fmtMoney(worstEmotion[1].pnl) : ''}
        />
      </div>

      {/* Trade history */}
      <GlassCard padding="p-6" hover={false}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-title-3 text-label">Trade History</h3>
            <p className="text-footnote text-label-secondary mt-0.5">
              {trades.length} trade{trades.length === 1 ? '' : 's'} in this session
            </p>
          </div>
        </div>
        <HistoryTable />
      </GlassCard>
    </motion.div>
  )
}

function StripCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color?: 'success' | 'danger'
}) {
  return (
    <div className="glass p-5">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-label-tertiary mb-1">
        {label}
      </p>
      <p
        className={cn(
          'text-[24px] font-bold tabular-nums tracking-tight',
          color === 'success' && 'text-success',
          color === 'danger' && 'text-danger'
        )}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[12px] text-label-tertiary mt-0.5">{sub}</p>
      )}
    </div>
  )
}

function HistoryTable() {
  const trades = useStore((s) => s.trades)

  if (trades.length === 0) {
    return <EmptyState type="journal_no_trades" />
  }

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">
            <th className="px-3 py-3 font-semibold">Time</th>
            <th className="px-3 py-3 font-semibold">Pair</th>
            <th className="px-3 py-3 font-semibold">Direction</th>
            <th className="px-3 py-3 font-semibold">Entry</th>
            <th className="px-3 py-3 font-semibold">Lot</th>
            <th className="px-3 py-3 font-semibold">Result</th>
            <th className="px-3 py-3 font-semibold text-right">P&L</th>
            <th className="px-3 py-3 font-semibold">Emotion</th>
            <th className="px-3 py-3 font-semibold">Flags</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <motion.tr
              key={t.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t border-white/[0.06] hover:bg-white/[0.03] transition-colors"
            >
              <td className="px-3 py-4 text-label-tertiary tabular-nums">
                {new Date(t.openedAt).toTimeString().slice(0, 5)}
              </td>
              <td className="px-3 py-4 font-semibold text-label">{t.pair}</td>
              <td className="px-3 py-4">
                <span
                  className={`chip ${
                    t.direction === 'LONG' ? 'chip-success' : 'chip-danger'
                  }`}
                >
                  {t.direction}
                </span>
              </td>
              <td className="px-3 py-4 text-label-secondary tabular-nums">
                {t.entryPrice.toFixed(4)}
              </td>
              <td className="px-3 py-4 text-label-secondary tabular-nums">
                {t.lotSize.toFixed(2)}
              </td>
              <td className="px-3 py-4">
                <span
                  className={cn(
                    'text-[13px] font-bold',
                    t.result === 'WIN' && 'text-success',
                    t.result === 'LOSS' && 'text-danger',
                    !t.result && 'text-label-tertiary'
                  )}
                >
                  {t.result || 'OPEN'}
                </span>
              </td>
              <td
                className={cn(
                  'px-3 py-4 text-right font-semibold tabular-nums',
                  t.pnl >= 0 ? 'text-success' : 'text-danger'
                )}
              >
                {fmtMoney(t.pnl)}
              </td>
              <td className="px-3 py-4">
                <span className="text-[12px] font-semibold text-label-secondary">
                  {t.emotion}
                </span>
              </td>
              <td className="px-3 py-4">
                {t.ruleViolations.length > 0 ? (
                  <GlassBadge tone="danger">
                    <Icon name="warning" className="w-3 h-3" />
                    {t.ruleViolations.length}
                  </GlassBadge>
                ) : (
                  <span className="text-[12px] text-label-tertiary">Clean</span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
