'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { fmtTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const DOT_COLOR = {
  success: '#30D158',
  danger: '#FF3B30',
  warning: '#FF9F0A',
  accent: '#007AFF',
} as const

export function LiveFeed() {
  const trades = useStore((s) => s.trades)
  const violations = useStore((s) => s.violations)
  const chatMessages = useStore((s) => s.chatMessages)

  const events: Array<{
    type: 'trade' | 'violation' | 'companion'
    time: string
    label: string
    sub?: string
    tone: keyof typeof DOT_COLOR
  }> = []

  trades.slice(0, 5).forEach((t) => {
    events.push({
      type: 'trade',
      time: t.openedAt,
      label: `${t.direction} ${t.pair}`,
      sub: `${t.lotSize} lots · ${t.result || 'Open'}`,
      tone:
        t.result === 'WIN'
          ? 'success'
          : t.result === 'LOSS'
            ? 'danger'
            : 'accent',
    })
  })
  violations.slice(0, 3).forEach((v) => {
    events.push({
      type: 'violation',
      time: v.createdAt,
      label: v.type.replace(/_/g, ' '),
      sub: v.description,
      tone: 'danger',
    })
  })
  chatMessages
    .filter((m) => m.from === 'bot')
    .slice(-3)
    .forEach((m) => {
      events.push({
        type: 'companion',
        time: m.timestamp,
        label: 'Trepid',
        sub: m.text,
        tone: 'warning',
      })
    })

  const sorted = events
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8)

  return (
    <div className="glass p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-title-3 text-label">Live Feed</h3>
          <p className="text-footnote text-label-secondary mt-0.5">
            Everything happening this session
          </p>
        </div>
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
          <span className="relative rounded-full w-2 h-2 bg-success" />
        </span>
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin pr-1 -mr-1">
        {sorted.length === 0 && (
          <p className="text-center text-label-tertiary text-[14px] py-12">
            No events yet
          </p>
        )}
        {sorted.map((e, i) => (
          <motion.div
            key={`${e.time}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3 p-3 rounded-[12px] hover:bg-white/[0.04] transition-colors"
          >
            <div
              className="w-2 h-2 rounded-full mt-2 shrink-0"
              style={{
                backgroundColor: DOT_COLOR[e.tone],
                boxShadow: `0 0 8px ${DOT_COLOR[e.tone]}80`,
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[14px] font-semibold text-label truncate">
                  {e.label}
                </p>
                <span className="text-[11px] text-label-tertiary shrink-0 tabular-nums">
                  {fmtTime(e.time)}
                </span>
              </div>
              {e.sub && (
                <p className="text-[13px] text-label-secondary mt-0.5 line-clamp-2">
                  {e.sub}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
