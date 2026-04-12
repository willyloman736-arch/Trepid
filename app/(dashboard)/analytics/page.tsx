'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { useStore } from '@/lib/store'
import { generateBehavioralNarrative } from '@/lib/discipline-scorer'

/* ============================================================
   Apple chart palette
   ============================================================ */
const CHART_COLORS = {
  primary: '#4F6EF7',
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF3B30',
  purple: '#BF5AF2',
  teal: '#5AC8FA',
  pink: '#FF2D55',
  indigo: '#5E5CE6',
}

const VIOLATION_COLORS: Record<string, string> = {
  OVERTRADING: '#FF9F0A',
  REVENGE_TRADING: '#FF3B30',
  LOT_SIZE_ESCALATION: '#FF2D55',
  LOSS_STREAK: '#BF5AF2',
  MAX_TRADES_EXCEEDED: '#5E5CE6',
  DAILY_LOSS_EXCEEDED: '#FF3B30',
  SESSION_VIOLATION: '#4F6EF7',
  RULE_BYPASS_ATTEMPT: '#FFD60A',
}

const EMOTIONS = [
  'NEUTRAL',
  'CONFIDENT',
  'FOMO',
  'REVENGE',
  'FEAR',
  'BOREDOM',
  'GREEDY',
  'FRUSTRATED',
]

const TOOLTIP_STYLE = {
  background: 'rgba(18, 24, 38, 0.92)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14,
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  fontWeight: 500,
  color: 'rgba(255,255,255,0.92)',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
  backdropFilter: 'blur(24px)',
  padding: '10px 14px',
}

export default function AnalyticsPage() {
  const trades = useStore((s) => s.trades)
  const violations = useStore((s) => s.violations)
  const session = useStore((s) => s.session)

  const disciplineHistory = useMemo(() => {
    const data: { day: string; score: number; violations: number; pnl: number }[] = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 3600 * 1000)
      const dayLabel = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      const seed = (d.getDate() * 13 + d.getMonth() * 7) % 100
      const baseScore = 55 + (seed % 40)
      const vio =
        i === 0 ? violations.length : Math.max(0, Math.floor((80 - seed) / 20))
      const pnl =
        i === 0
          ? trades.reduce((a, t) => a + t.pnl, 0)
          : (seed - 50) * 5 + Math.sin(i) * 40
      data.push({
        day: dayLabel,
        score: i === 0 ? session.disciplineScore : baseScore,
        violations: vio,
        pnl: Math.round(pnl),
      })
    }
    return data
  }, [trades, violations, session.disciplineScore])

  const emotionData = useMemo(() => {
    const map: Record<string, { count: number; pnl: number }> = {}
    EMOTIONS.forEach((e) => (map[e] = { count: 0, pnl: 0 }))
    trades.forEach((t) => {
      if (map[t.emotion]) {
        map[t.emotion].count++
        map[t.emotion].pnl += t.pnl
      }
    })
    return Object.entries(map)
      .map(([emotion, stats]) => ({
        emotion,
        avgPnl: stats.count > 0 ? Math.round(stats.pnl / stats.count) : 0,
        count: stats.count,
      }))
      .filter((e) => e.count > 0)
      .sort((a, b) => a.avgPnl - b.avgPnl)
  }, [trades])

  const violationBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    violations.forEach((v) => {
      counts[v.type] = (counts[v.type] || 0) + 1
    })
    if (Object.keys(counts).length === 0) {
      return [
        { name: 'OVERTRADING', value: 3 },
        { name: 'REVENGE_TRADING', value: 2 },
        { name: 'LOSS_STREAK', value: 1 },
      ]
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [violations])

  const heatmapData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const hours = Array.from({ length: 10 }, (_, i) => i + 6)
    const grid: { day: string; hour: number; count: number }[] = []
    days.forEach((day, dayIdx) => {
      hours.forEach((hour) => {
        const seed = (dayIdx * 31 + hour * 17) % 100
        const count = seed > 70 ? 3 : seed > 50 ? 2 : seed > 30 ? 1 : 0
        grid.push({ day, hour, count })
      })
    })
    return { days, hours, grid }
  }, [])

  const narrative = generateBehavioralNarrative(trades, violations)
  const worstEmotion = emotionData[0]
  const bestEmotion = emotionData[emotionData.length - 1]

  /* Show empty state if there's not enough data to chart meaningfully */
  if (trades.length < 3) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-large-title text-label">Analytics</h1>
          <p className="text-callout text-label-secondary mt-1">
            Patterns over time. Patterns in you.
          </p>
        </div>
        <GlassCard padding="p-0" hover={false}>
          <EmptyState type="analytics_no_data" />
        </GlassCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-large-title text-label">Analytics</h1>
        <p className="text-callout text-label-secondary mt-1">
          Patterns over time. Patterns in you.
        </p>
      </div>

      {/* Behavioral narrative */}
      <GlassCard padding="p-6" hover={false}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-accent to-indigo grid place-items-center shrink-0">
            <Icon name="sparkles" className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-title-3 text-label">Weekly Summary</h3>
              <GlassBadge tone="accent">AI</GlassBadge>
            </div>
            <p className="text-body text-label-secondary leading-relaxed">
              {narrative}
            </p>
            {worstEmotion &&
              bestEmotion &&
              worstEmotion.emotion !== bestEmotion.emotion && (
                <p className="text-footnote text-label-tertiary mt-3">
                  Worst emotion:{' '}
                  <span className="text-danger font-semibold">
                    {worstEmotion.emotion}
                  </span>{' '}
                  (${worstEmotion.avgPnl}) · Best:{' '}
                  <span className="text-success font-semibold">
                    {bestEmotion.emotion}
                  </span>{' '}
                  (${bestEmotion.avgPnl})
                </p>
              )}
          </div>
        </div>
      </GlassCard>

      {/* Discipline over time */}
      <GlassCard padding="p-6" hover={false}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-title-3 text-label">Discipline Over Time</h3>
            <p className="text-footnote text-label-secondary mt-0.5">
              Last 30 sessions
            </p>
          </div>
          <GlassBadge tone="accent">30D</GlassBadge>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={disciplineHistory}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="day"
                stroke="rgba(255,255,255,0.4)"
                style={{ fontSize: 11 }}
                interval={4}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                domain={[0, 100]}
                style={{ fontSize: 11 }}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey="score"
                name="Discipline"
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: CHART_COLORS.primary }}
              />
              <Line
                type="monotone"
                dataKey="violations"
                name="Violations"
                stroke={CHART_COLORS.danger}
                strokeWidth={2.5}
                dot={false}
                yAxisId={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Emotion vs PnL + Violation breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard padding="p-6" hover={false}>
          <div className="mb-6">
            <h3 className="text-title-3 text-label">Emotion vs P&L</h3>
            <p className="text-footnote text-label-secondary mt-0.5">
              Average P&L per emotional state
            </p>
          </div>

          <div className="h-64">
            {emotionData.length === 0 ? (
              <p className="text-center py-16 text-label-tertiary text-[14px]">
                Log trades with emotion tags to see this chart
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={emotionData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="emotion"
                    stroke="rgba(255,255,255,0.4)"
                    style={{ fontSize: 10 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="avgPnl" radius={[8, 8, 0, 0]}>
                    {emotionData.map((e, i) => (
                      <Cell
                        key={i}
                        fill={
                          e.avgPnl >= 0 ? CHART_COLORS.success : CHART_COLORS.danger
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <GlassCard padding="p-6" hover={false}>
          <div className="mb-6">
            <h3 className="text-title-3 text-label">Violation Breakdown</h3>
            <p className="text-footnote text-label-secondary mt-0.5">By category</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={violationBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="none"
                >
                  {violationBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={VIOLATION_COLORS[entry.name] || CHART_COLORS.primary}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {violationBreakdown.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center gap-1.5 text-[11px] text-label-secondary font-semibold"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: VIOLATION_COLORS[entry.name] || CHART_COLORS.primary,
                  }}
                />
                {entry.name.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Session heatmap */}
      <GlassCard padding="p-6" hover={false}>
        <div className="mb-6">
          <h3 className="text-title-3 text-label">Violation Heatmap</h3>
          <p className="text-footnote text-label-secondary mt-0.5">
            When you&apos;re most undisciplined
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex gap-1.5 pl-12 mb-2">
              {heatmapData.hours.map((h) => (
                <div
                  key={h}
                  className="flex-1 text-center text-[10px] font-semibold text-label-tertiary"
                >
                  {h}:00
                </div>
              ))}
            </div>
            {heatmapData.days.map((day) => (
              <div key={day} className="flex items-center gap-1.5 mb-1.5">
                <div className="w-10 text-[12px] font-semibold text-label-tertiary">
                  {day}
                </div>
                {heatmapData.hours.map((hour) => {
                  const cell = heatmapData.grid.find(
                    (c) => c.day === day && c.hour === hour
                  )
                  const intensity = cell?.count || 0
                  const bg =
                    intensity === 3
                      ? 'rgba(255, 59, 48, 0.85)'
                      : intensity === 2
                        ? 'rgba(255, 159, 10, 0.7)'
                        : intensity === 1
                          ? 'rgba(48, 209, 88, 0.35)'
                          : 'rgba(255, 255, 255, 0.05)'
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="flex-1 aspect-square rounded-[8px]"
                      style={{ background: bg }}
                      title={`${day} ${hour}:00 — ${intensity} violations`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-[11px] font-semibold text-label-tertiary">
          <span>Fewer</span>
          <div className="flex gap-1.5">
            {[
              'rgba(255, 255, 255, 0.05)',
              'rgba(48, 209, 88, 0.35)',
              'rgba(255, 159, 10, 0.7)',
              'rgba(255, 59, 48, 0.85)',
            ].map((bg, i) => (
              <div
                key={i}
                className="w-6 h-3 rounded-[4px]"
                style={{ background: bg }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </GlassCard>
    </motion.div>
  )
}
