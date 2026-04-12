'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { GlassButton } from '@/components/ui/GlassButton'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'
import type { StudentSummary } from '@/types'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'attention' | 'disciplined'

export default function MentorDashboardPage() {
  const students = useStore((s) => s.mockStudents)
  const setRole = useStore((s) => s.setViewAsRole)
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = students.filter((s) => {
    if (filter === 'all') return true
    if (filter === 'attention') return s.status !== 'DISCIPLINED'
    return s.status === 'DISCIPLINED'
  })

  const avgScore = Math.round(
    students.reduce((a, s) => a + s.disciplineScore, 0) / Math.max(1, students.length)
  )
  const alertsToday = students.filter((s) => s.lastAlertAt).length
  const criticalCount = students.filter((s) => s.status === 'CRITICAL').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GlassBadge tone="accent" pulse>
              Mentor Mode
            </GlassBadge>
          </div>
          <h1 className="text-large-title text-label">Your Roster</h1>
          <p className="text-callout text-label-secondary mt-1 max-w-xl">
            Live discipline signals from every student you coach.
          </p>
        </div>
        <GlassButton variant="ghost" onClick={() => setRole('TRADER')}>
          <Icon name="user" className="w-4 h-4" strokeWidth={2.2} />
          Exit Mentor View
        </GlassButton>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MentorStat
          label="Total Students"
          value={students.length.toString()}
          tone="accent"
        />
        <MentorStat
          label="Avg Discipline"
          value={avgScore.toString()}
          sub="/ 100"
          tone={avgScore >= 75 ? 'success' : avgScore >= 50 ? 'warning' : 'danger'}
        />
        <MentorStat
          label="Alerts Today"
          value={alertsToday.toString()}
          tone={alertsToday > 0 ? 'warning' : 'slate'}
        />
        <MentorStat
          label="Critical"
          value={criticalCount.toString()}
          tone={criticalCount > 0 ? 'danger' : 'slate'}
        />
      </div>

      {/* Filter tabs */}
      <div
        className="inline-flex p-1 rounded-[14px]"
        style={{ background: 'rgba(0,0,0,0.06)' }}
      >
        {(
          [
            { id: 'all' as Filter, label: 'All students' },
            { id: 'attention' as Filter, label: 'Needs attention' },
            { id: 'disciplined' as Filter, label: 'Disciplined' },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={cn(
              'relative px-5 py-2 rounded-[10px] text-[14px] font-semibold transition-colors',
              filter === t.id ? 'text-label' : 'text-label-secondary hover:text-label'
            )}
          >
            {filter === t.id && (
              <motion.div
                layoutId="mentor-filter-ind"
                className="absolute inset-0 bg-white rounded-[10px] shadow-sm"
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Student list — iOS Settings style */}
      <GlassCard padding="p-0" hover={false} className="overflow-hidden">
        <div className="divide-y divide-white/[0.08]">
          {filtered.length === 0 ? (
            <p className="text-center py-16 text-label-tertiary text-[14px]">
              No students match this filter
            </p>
          ) : (
            filtered.map((student, i) => (
              <StudentRow
                key={student.id}
                student={student}
                expanded={expandedId === student.id}
                onExpand={() =>
                  setExpandedId((prev) => (prev === student.id ? null : student.id))
                }
                index={i}
              />
            ))
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}

function StudentRow({
  student,
  expanded,
  onExpand,
  index,
}: {
  student: StudentSummary
  expanded: boolean
  onExpand: () => void
  index: number
}) {
  const scoreTone =
    student.disciplineScore >= 80
      ? 'text-success'
      : student.disciplineScore >= 50
        ? 'text-warning'
        : 'text-danger'

  const statusTone: Record<
    StudentSummary['status'],
    'success' | 'warning' | 'danger'
  > = {
    DISCIPLINED: 'success',
    AT_RISK: 'warning',
    CRITICAL: 'danger',
  }

  const initials = student.name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
    >
      <button
        onClick={onExpand}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors text-left"
      >
        <div
          className={cn(
            'w-10 h-10 rounded-[12px] grid place-items-center font-bold text-[14px] shrink-0',
            student.status === 'CRITICAL'
              ? 'bg-danger/15 text-danger'
              : student.status === 'AT_RISK'
                ? 'bg-warning/15 text-warning'
                : 'bg-success/15 text-success'
          )}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-label truncate">
            {student.name}
          </p>
          <p className="text-[12px] text-label-tertiary truncate">
            {student.email}
          </p>
        </div>

        {/* Score */}
        <div className="hidden sm:block text-right shrink-0">
          <div className="flex items-baseline gap-1">
            <span
              className={cn('text-[20px] font-bold tabular-nums', scoreTone)}
            >
              {student.disciplineScore}
            </span>
            <span className="text-[11px] text-label-tertiary">/100</span>
          </div>
          <p className="text-[11px] text-label-tertiary tabular-nums">
            {student.tradesToday}/{student.maxTrades} trades
          </p>
        </div>

        {/* Loss streak */}
        {student.lossStreak > 0 && (
          <div className="hidden md:flex gap-0.5 shrink-0">
            {Array.from({ length: student.lossStreak }).map((_, i) => (
              <div key={i} className="w-1 h-5 rounded-full bg-danger" />
            ))}
          </div>
        )}

        <GlassBadge tone={statusTone[student.status]} pulse={student.status !== 'DISCIPLINED'}>
          {student.status.replace('_', ' ')}
        </GlassBadge>

        <Icon
          name="chevron-right"
          className={cn(
            'w-4 h-4 text-label-tertiary shrink-0 transition-transform',
            expanded && 'rotate-90'
          )}
          strokeWidth={2.2}
        />
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden bg-white/[0.03]"
        >
          <div className="px-5 py-5 pl-[76px] grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-label-tertiary mb-1">
                Session Summary
              </p>
              <p className="text-[13px] text-label-secondary">
                {student.tradesToday} trades today, {student.violations} violation
                {student.violations === 1 ? '' : 's'}, loss streak {student.lossStreak}.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-label-tertiary mb-1">
                Recent Violation
              </p>
              <p className="text-[13px] text-label-secondary">
                {student.recentViolation || 'None this session'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-label-tertiary mb-1">
                Enforcement Level
              </p>
              <p className="text-[14px] font-bold text-label">
                Level {student.enforcementLevel} of 6
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function MentorStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub?: string
  tone: 'success' | 'warning' | 'danger' | 'accent' | 'slate'
}) {
  const colorHex =
    tone === 'success'
      ? '#30D158'
      : tone === 'warning'
        ? '#FF9F0A'
        : tone === 'danger'
          ? '#FF3B30'
          : tone === 'accent'
            ? '#007AFF'
            : 'rgba(0,0,0,0.3)'

  return (
    <div className="glass p-6">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-label-tertiary">
          {label}
        </p>
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: colorHex, boxShadow: `0 0 10px ${colorHex}80` }}
        />
      </div>
      <p className="text-[36px] font-bold text-label tabular-nums tracking-tight leading-none">
        {value}
        {sub && <span className="text-[16px] text-label-tertiary ml-1">{sub}</span>}
      </p>
    </div>
  )
}
