'use client'

import { motion } from 'framer-motion'
import { ease } from '@/lib/animation'

/* ============================================================
   EmptyState — personality-driven empty states with icon +
   title + subtitle + optional CTA button. Use the keyed variants
   or pass a custom state object directly.
   ============================================================ */

export interface EmptyStateConfig {
  icon: string
  title: string
  subtitle: string
  color: string
  cta?: string
  onCta?: () => void
}

/* Keyed presets — typed map, not an enum, so we get strong inference */
export const emptyStates = {
  journal_no_trades: {
    icon: '◎',
    title: 'No trades yet today.',
    subtitle:
      "Either the market has no setup — or you're waiting for the right one. Good.",
    color: '#30D158',
  },
  journal_no_violations: {
    icon: '◈',
    title: 'Zero violations this session.',
    subtitle: 'This is what discipline looks like. Keep it this way.',
    color: '#30D158',
  },
  rules_none_set: {
    icon: '◻',
    title: 'No rules set.',
    subtitle:
      'A trader without rules is just gambling. Set your first rule.',
    cta: 'Set your first rule →',
    color: '#FF9F0A',
  },
  analytics_no_data: {
    icon: '◑',
    title: 'Not enough data yet.',
    subtitle:
      'Trepid needs at least 5 sessions to show behavioral patterns. Keep trading.',
    color: '#4F6EF7',
  },
  notifications_empty: {
    icon: '◉',
    title: 'All clear.',
    subtitle: 'No violations, no alerts. Clean trading.',
    color: '#30D158',
  },
  accountability_no_partners: {
    icon: '◯',
    title: 'No accountability partners.',
    subtitle:
      'Discipline is easier when someone is watching. Add a mentor or partner.',
    cta: 'Add a partner →',
    color: '#5E5CE6',
  },
} as const satisfies Record<string, EmptyStateConfig>

export type EmptyStateKey = keyof typeof emptyStates

interface EmptyStateProps {
  type: EmptyStateKey
  onCta?: () => void
}

export function EmptyState({ type, onCta }: EmptyStateProps) {
  const state = emptyStates[type] as EmptyStateConfig
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: ease.appleOut }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.1,
          type: 'spring',
          stiffness: 300,
          damping: 22,
        }}
        style={{
          fontSize: 54,
          lineHeight: 1,
          color: state.color,
          marginBottom: 20,
          filter: `drop-shadow(0 0 16px ${state.color}60)`,
        }}
      >
        {state.icon}
      </motion.div>
      <h3 className="text-[18px] font-bold text-label mb-2 tracking-tight">
        {state.title}
      </h3>
      <p className="text-[14px] text-label-secondary max-w-[320px] leading-relaxed">
        {state.subtitle}
      </p>
      {state.cta && (
        <button
          onClick={onCta}
          className="btn-primary mt-6 !px-6 !py-3 !text-[14px]"
        >
          {state.cta}
        </button>
      )}
    </motion.div>
  )
}
