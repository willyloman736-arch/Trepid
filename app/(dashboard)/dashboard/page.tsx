'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { StatCard } from '@/components/dashboard/SessionStats'
import { EnforcementLadder } from '@/components/dashboard/EnforcementLadder'
import { RuleStatus } from '@/components/dashboard/RuleStatus'
import { LiveFeed } from '@/components/dashboard/LiveFeed'
import { DisciplineOrb } from '@/components/3d/ClientOnly'
import { ProgressRing, scoreRingColor } from '@/components/ui/ProgressRing'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { useSnapshot } from '@/lib/store'
import { fmtMoney } from '@/lib/utils'
import { scoreColor, scoreLabel } from '@/lib/discipline-scorer'
import { LEVEL_LABELS } from '@/lib/enforcement-engine'
import { useMorningPriming } from '@/hooks/useMorningPriming'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  useMorningPriming()
  const snap = useSnapshot()
  const {
    trades,
    wins,
    losses,
    totalPnl,
    winRate,
    lossStreak,
    rules,
    session,
    enforcement,
  } = snap

  const maxTradesRule = rules.find((r) => r.type === 'MAX_TRADES_PER_DAY')
  const maxLossRule = rules.find((r) => r.type === 'MAX_DAILY_LOSS')
  const maxTrades = maxTradesRule?.value ?? 3
  const maxLoss = maxLossRule?.value ?? 300
  const dailyLoss = -trades
    .filter((t) => t.pnl < 0)
    .reduce((a, t) => a + t.pnl, 0)

  const scoreCol = scoreColor(session.disciplineScore)
  const scoreHex =
    scoreCol === 'success' ? '#30D158' : scoreCol === 'warning' ? '#FF9F0A' : '#FF3B30'
  const scoreText =
    scoreCol === 'success'
      ? 'You are DISCIPLINED'
      : scoreCol === 'warning'
        ? 'You are AT RISK'
        : 'You are CRITICAL'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Page heading — clean Apple style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <h1 className="text-large-title text-label">Today</h1>
        <p className="text-callout text-label-secondary mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </motion.div>

      {/* Hero — score ring + orb */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="hero-score-card glass p-8 md:p-10 overflow-hidden relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_320px] gap-8 items-center">
          {/* Left: score number + verdict (animated) */}
          <div className="relative z-[2]">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-label-tertiary mb-3">
              Discipline Score
            </p>
            <div className="flex items-baseline gap-3">
              <AnimatedNumber
                value={session.disciplineScore}
                className="hero-score-number text-[96px] font-extrabold leading-none tracking-[-0.04em] tabular-nums"
                style={{ color: scoreHex }}
              />
              <span className="hero-score-suffix text-[32px] text-label-tertiary font-medium tracking-tight">
                / 100
              </span>
            </div>
            <p
              className="mt-3 text-title-2 tracking-tight"
              style={{ color: scoreHex }}
            >
              {scoreText}
            </p>
            <p className="mt-1 text-body text-label-secondary">
              {scoreLabel(session.disciplineScore)} — keep your edge sharp.
            </p>
          </div>

          {/* Middle: Apple Watch style progress ring */}
          <div className="hidden lg:flex items-center justify-center relative z-[2]">
            <ProgressRing
              value={session.disciplineScore}
              max={100}
              size={140}
              strokeWidth={12}
              color={scoreRingColor(session.disciplineScore)}
              label={`${session.disciplineScore}`}
              sublabel="Score"
            />
          </div>

          {/* Right: 3D orb */}
          <div className="relative w-full h-[240px] lg:h-[280px]">
            <DisciplineOrb
              score={session.disciplineScore}
              className="absolute inset-0"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats grid — now with ProgressRings + AnimatedNumbers */}
      <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Trades Today"
          value={`${trades.length}`}
          numericValue={trades.length}
          sub={
            trades.length > maxTrades
              ? 'Over limit'
              : `${maxTrades - trades.length} remaining of ${maxTrades}`
          }
          over={trades.length > maxTrades}
          icon="trending-up"
          accent={trades.length > maxTrades ? 'danger' : 'accent'}
          progress={(trades.length / maxTrades) * 100}
          ringValue={trades.length}
          ringMax={maxTrades}
          delay={0.15}
        />
        <StatCard
          label="Daily P&L"
          value={fmtMoney(totalPnl)}
          numericValue={totalPnl}
          format={(n) => fmtMoney(n)}
          sub={`${wins}W / ${losses}L · ${winRate}% win rate`}
          icon={totalPnl >= 0 ? 'trending-up' : 'trending-down'}
          accent={totalPnl >= 0 ? 'success' : 'danger'}
          delay={0.2}
        />
        <StatCard
          label="Loss Streak"
          value={lossStreak.toString()}
          numericValue={lossStreak}
          sub={lossStreak >= 2 ? 'Cooldown needed' : 'Under control'}
          icon="fire"
          accent={lossStreak >= 2 ? 'danger' : lossStreak >= 1 ? 'warning' : 'slate'}
          over={lossStreak >= 2}
          progress={Math.min((lossStreak / 3) * 100, 100)}
          ringValue={lossStreak}
          ringMax={3}
          delay={0.25}
        />
        <StatCard
          label="Daily Loss"
          value={fmtMoney(-dailyLoss)}
          numericValue={-dailyLoss}
          format={(n) => fmtMoney(n)}
          sub={`Cap $${maxLoss}`}
          icon="target"
          accent={
            dailyLoss > maxLoss
              ? 'danger'
              : dailyLoss > maxLoss * 0.7
                ? 'warning'
                : 'slate'
          }
          progress={(dailyLoss / maxLoss) * 100}
          ringValue={dailyLoss}
          ringMax={maxLoss}
          over={dailyLoss > maxLoss}
          delay={0.3}
        />
      </div>

      {/* Enforcement status card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="glass p-8"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-label-tertiary mb-1">
              Enforcement Status
            </p>
            <h2 className="text-title-2 text-label">
              {enforcement.level === 0 ? 'All clear' : LEVEL_LABELS[enforcement.level]}
            </h2>
            <p className="text-callout text-label-secondary mt-1 max-w-xl">
              {enforcement.message}
            </p>
          </div>
        </div>
        <EnforcementLadder level={enforcement.level} />
      </motion.div>

      {/* Rules + Live feed */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5"
      >
        <RuleStatus />
        <LiveFeed />
      </motion.div>

      {/* Recent trades */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="glass p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-title-3 text-label">Recent Trades</h3>
            <p className="text-footnote text-label-secondary mt-0.5">
              Last {Math.min(5, trades.length)} positions
            </p>
          </div>
          <Link
            href="/journal"
            className="text-[14px] font-semibold text-accent hover:text-accent-hover transition-colors"
          >
            View all
          </Link>
        </div>
        <RecentTradesTable trades={trades.slice(0, 5)} />
      </motion.div>
    </motion.div>
  )
}

function RecentTradesTable({
  trades,
}: {
  trades: ReturnType<typeof useSnapshot>['trades']
}) {
  if (trades.length === 0) {
    return (
      <p className="text-center text-label-tertiary text-[14px] py-12">
        No trades yet
      </p>
    )
  }
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">
            <th className="px-3 py-3 font-semibold">Pair</th>
            <th className="px-3 py-3 font-semibold">Side</th>
            <th className="px-3 py-3 font-semibold">Lot</th>
            <th className="px-3 py-3 font-semibold">Result</th>
            <th className="px-3 py-3 font-semibold text-right">P&L</th>
            <th className="px-3 py-3 font-semibold text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr
              key={t.id}
              className="border-t border-white/[0.06] hover:bg-white/[0.03] transition-colors"
            >
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
                {t.ruleViolations.length > 0 && (
                  <span className="chip chip-danger ml-2">
                    <Icon name="warning" className="w-3 h-3" />
                    Violation
                  </span>
                )}
              </td>
              <td
                className={cn(
                  'px-3 py-4 text-right font-semibold tabular-nums',
                  t.pnl >= 0 ? 'text-success' : 'text-danger'
                )}
              >
                {fmtMoney(t.pnl)}
              </td>
              <td className="px-3 py-4 text-right text-label-tertiary text-[13px] tabular-nums">
                {new Date(t.openedAt).toTimeString().slice(0, 5)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
